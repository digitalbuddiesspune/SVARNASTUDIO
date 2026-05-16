import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  formatCurrency,
  parseOptionalAmount,
  formatRupeeCell,
  invoiceTotals,
} from '../utils/invoiceFormat'
import { invoiceViewPath } from '../utils/invoicePaths'

/** Default logo: file `frontend/public/invoice-logo.png` (URL from site root). */
const DEFAULT_INVOICE_LOGO = `${import.meta.env.BASE_URL}invoice-logo.png`

/** Fixed company contact on invoice (not editable by user). Order: phones → email → web → address. */
const COMPANY_PHONES = ['+91 73504 95906', '+91 86686 56703']
const COMPANY_EMAIL = 'contact@svarnastudio.in'
const COMPANY_ADDRESS_LINES = ['Ganesha Residency, Bhole Baba Nagar,', 'Uday Nagar, Nagpur']
const COMPANY_ADDRESS = COMPANY_ADDRESS_LINES.join('\n')

const DEFAULT_COMPANY_NAME = 'Svarna Studio'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const createRowId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `row-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

const createEmptyRow = () => ({
  id: createRowId(),
  /** Set when a row picks from catalog; used for select value only (not stored on invoice). */
  productId: '',
  name: '',
  category: '',
  mrp: '',
  discountedPrice: '',
})

function invoiceCategoryFromProduct(p) {
  const cat = String(p?.category || '').trim()
  const sub = String(p?.subCategory || '').trim()
  if (cat && sub) return `${cat} — ${sub}`
  return cat || sub || ''
}

const initialDraft = () => ({
  logoDataUrl: DEFAULT_INVOICE_LOGO,
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  customerAddress: '',
  orderDate: '',
  orderStatus: '',
  paymentStatus: '',
  paymentMode: '',
  upiId: '',
  gstPercent: '',
  rows: [createEmptyRow()],
})

function displayToField(value) {
  if (value === null || value === undefined) return ''
  const s = String(value).trim()
  return s === '—' ? '' : s
}

function invoiceToDraft(inv) {
  const rows = (inv?.rows || []).map((row) => ({
    id: row.id || createRowId(),
    productId: row.productId ? String(row.productId) : '',
    name: String(row.name || '').trim(),
    category: String(row.category || '').trim(),
    mrp: row.mrp != null && row.mrp !== '' ? String(row.mrp) : '',
    discountedPrice:
      row.discountedPrice != null && row.discountedPrice !== '' ? String(row.discountedPrice) : '',
  }))
  return {
    logoDataUrl: inv?.logoDataUrl || DEFAULT_INVOICE_LOGO,
    customerName: displayToField(inv?.customerName),
    customerEmail: displayToField(inv?.customerEmail),
    customerPhone: displayToField(inv?.customerPhone),
    customerAddress: displayToField(inv?.customerAddress),
    orderDate: inv?.orderDateInput || '',
    orderStatus: displayToField(inv?.orderStatus),
    paymentStatus: displayToField(inv?.paymentStatus),
    paymentMode: displayToField(inv?.paymentMode),
    upiId: displayToField(inv?.upiId),
    gstPercent:
      inv?.gstPercent != null && Number.isFinite(Number(inv.gstPercent)) && Number(inv.gstPercent) > 0
        ? String(inv.gstPercent)
        : '',
    rows: rows.length ? rows : [createEmptyRow()],
  }
}

function InvoiceGenerator({ className = '', editId = null, embedded = false }) {
  const navigate = useNavigate()
  const isEditMode = Boolean(editId)
  const [draft, setDraft] = useState(initialDraft)
  const [formError, setFormError] = useState('')
  const [catalogProducts, setCatalogProducts] = useState([])
  const [catalogStatus, setCatalogStatus] = useState('loading')
  const [isSaving, setIsSaving] = useState(false)
  const [loadingInvoice, setLoadingInvoice] = useState(isEditMode)
  const [editingMeta, setEditingMeta] = useState(null)
  const [nextOrderNo, setNextOrderNo] = useState('01')

  useEffect(() => {
    if (!editId) return undefined
    let cancelled = false
    ;(async () => {
      setLoadingInvoice(true)
      setFormError('')
      try {
        const res = await fetch(`${API_BASE_URL}/api/invoices/${encodeURIComponent(editId)}`)
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.message || 'Invoice not found')
        }
        const data = await res.json()
        if (cancelled) return
        setEditingMeta({
          _id: data._id,
          invoiceNumber: data.invoiceNumber,
          orderNo: data.orderNo,
          invoiceDateTime: data.invoiceDateTime,
        })
        setDraft(invoiceToDraft(data))
      } catch (e) {
        if (!cancelled) setFormError(e.message || 'Could not load invoice')
      } finally {
        if (!cancelled) setLoadingInvoice(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [editId])

  useEffect(() => {
    if (isEditMode) return undefined
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/invoices/preview-next`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (cancelled) return
        if (data.orderNo) setNextOrderNo(String(data.orderNo))
      } catch (e) {
        console.error('Invoice preview', e)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/products`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (cancelled) return
        setCatalogProducts(Array.isArray(data) ? data : [])
        setCatalogStatus('ok')
      } catch (e) {
        console.error('Invoice catalog', e)
        if (!cancelled) {
          setCatalogProducts([])
          setCatalogStatus('error')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const catalogSorted = useMemo(
    () =>
      [...catalogProducts].sort((a, b) =>
        String(a.productName || '').localeCompare(String(b.productName || ''), undefined, {
          sensitivity: 'base',
        }),
      ),
    [catalogProducts],
  )

  const draftTotals = useMemo(
    () =>
      invoiceTotals({
        rows: draft.rows,
        gstPercent: draft.gstPercent.trim() === '' ? 0 : draft.gstPercent,
      }),
    [draft.rows, draft.gstPercent],
  )

  const applyCatalogSelection = useCallback((rowId, productId) => {
    setDraft((prev) => ({
      ...prev,
      rows: prev.rows.map((row) => {
        if (row.id !== rowId) return row
        if (!productId) {
          return { ...row, productId: '', name: '', category: '', mrp: '', discountedPrice: '' }
        }
        const p = catalogProducts.find((x) => String(x._id) === String(productId))
        if (!p) {
          return { ...row, productId: '', name: '', category: '', mrp: '', discountedPrice: '' }
        }
        const mrp = p.price?.mrp
        const disc = p.price?.discountedPrice ?? mrp
        return {
          ...row,
          productId: String(p._id),
          name: String(p.productName || '').trim(),
          category: invoiceCategoryFromProduct(p),
          mrp: mrp != null && Number.isFinite(Number(mrp)) ? String(mrp) : '',
          discountedPrice:
            disc != null && Number.isFinite(Number(disc)) ? String(disc) : '',
        }
      }),
    }))
  }, [catalogProducts])

  const setDraftField = useCallback((key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }, [])

  const updateDraftRow = useCallback((id, field, value) => {
    setDraft((prev) => ({
      ...prev,
      rows: prev.rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    }))
  }, [])

  const addDraftRow = () => {
    setDraft((prev) => ({ ...prev, rows: [...prev.rows, createEmptyRow()] }))
  }

  const removeDraftRow = (id) => {
    setDraft((prev) =>
      prev.rows.length <= 1 ? prev : { ...prev, rows: prev.rows.filter((r) => r.id !== id) },
    )
  }

  const buildPayload = (productRows) => {
    const orderNoRaw = isEditMode
      ? displayToField(editingMeta?.orderNo)
      : ''
    return {
      logoDataUrl: draft.logoDataUrl || DEFAULT_INVOICE_LOGO,
      companyName: DEFAULT_COMPANY_NAME,
      companyPhones: [...COMPANY_PHONES],
      companyEmail: COMPANY_EMAIL,
      companyAddress: COMPANY_ADDRESS,
      customerName: draft.customerName.trim(),
      customerEmail: draft.customerEmail.trim(),
      customerPhone: draft.customerPhone.trim(),
      customerAddress: draft.customerAddress.trim(),
      orderNo: orderNoRaw || undefined,
      orderDate: draft.orderDate.trim() || undefined,
      orderStatus: draft.orderStatus.trim(),
      paymentStatus: draft.paymentStatus.trim(),
      paymentMode: draft.paymentMode.trim(),
      upiId: draft.upiId.trim(),
      gstPercent: draft.gstPercent.trim() === '' ? 0 : Number(draft.gstPercent),
      lineItems: productRows.map((r) => ({
        lineId: r.id,
        productId: r.productId || undefined,
        name: String(r.name).trim(),
        category: String(r.category || '').trim(),
        mrp: r.mrp === '' ? null : r.mrp,
        discountedPrice: r.discountedPrice === '' ? null : r.discountedPrice,
      })),
    }
  }

  const validateDraft = () => {
    if (!draft.customerName.trim()) {
      setFormError('ग्राहकाचे नाव टाका / Please enter customer name.')
      return null
    }
    const productRows = draft.rows.filter((r) => String(r.name).trim())
    if (productRows.length === 0) {
      setFormError('किमान एक प्रॉडक्ट जोडा / Add at least one product with a name.')
      return null
    }
    return productRows
  }

  const handleGenerateInvoice = async () => {
    setFormError('')
    const productRows = validateDraft()
    if (!productRows) return

    setIsSaving(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(productRows)),
      })
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}))
        throw new Error(errorBody.message || 'Failed to save invoice to database')
      }
      const snapshot = await response.json()
      window.dispatchEvent(new CustomEvent('svarna-invoices-changed'))
      navigate(invoiceViewPath(snapshot))
    } catch (error) {
      setFormError(error.message || 'Could not save invoice')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateInvoice = async () => {
    setFormError('')
    if (!editingMeta?._id) {
      setFormError('Invoice not loaded.')
      return
    }
    const productRows = validateDraft()
    if (!productRows) return

    setIsSaving(true)
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/invoices/${encodeURIComponent(editingMeta._id)}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildPayload(productRows)),
        },
      )
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}))
        throw new Error(errorBody.message || 'Failed to update invoice')
      }
      const snapshot = await response.json()
      window.dispatchEvent(new CustomEvent('svarna-invoices-changed'))
      navigate(invoiceViewPath(snapshot))
    } catch (error) {
      setFormError(error.message || 'Could not update invoice')
    } finally {
      setIsSaving(false)
    }
  }

  const formInputClass =
    'w-full rounded-lg border border-[#ddc9b5] bg-white px-3 py-2 text-sm text-[#4d2018] shadow-sm outline-none transition focus:border-[#8f0019] focus:ring-2 focus:ring-[#8f0019]/20'

  const formLabelClass =
    'mb-1 block text-xs font-semibold uppercase tracking-wide text-[#5f1f17]'

  const shellClass = embedded
    ? `flex h-full min-h-0 max-w-full min-w-0 flex-col overflow-hidden bg-white ${className}`
    : `flex h-full min-h-0 max-w-full min-w-0 flex-col overflow-x-hidden rounded-2xl border border-[#eadbcb] bg-white p-4 shadow-md md:p-6 ${className}`

  return (
      <div className={shellClass}>
      <div
        className={`shrink-0 print:hidden ${
          embedded ? 'px-5 py-4 md:px-6 md:py-5' : 'mb-6'
        }`}
      >
        <h2 className="font-serif text-2xl font-semibold text-[#5f1f17] md:text-3xl">
          {isEditMode ? 'Edit Invoice' : 'Invoice Generator'}
        </h2>
      </div>

      {loadingInvoice ? (
        <p className="text-sm text-[#7a5b4f]">Loading invoice…</p>
      ) : (
      <>
      {/* —— Entry form —— */}
      <div
        className={`scrollbar-hide min-h-0 overflow-x-hidden print:hidden lg:flex-1 lg:overflow-y-auto lg:overscroll-contain ${
          embedded ? 'px-5 py-4 md:px-6 md:py-5' : ''
        }`}
      >
        <div
          className={
            embedded
              ? 'min-w-0 max-w-full'
              : 'min-w-0 max-w-full rounded-2xl border border-[#eadbcb] bg-white p-4 shadow-md sm:p-5 md:p-8'
          }
        >
          <h3 className="border-b border-[#f0dfd4] pb-3 font-serif text-lg font-bold text-[#6f1b1d]">
            Invoice details
          </h3>

          <div className="mt-6 grid gap-6">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#8f1328]">
                Invoice &amp; order
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={formLabelClass}>Order no</label>
                  <input
                    type="text"
                    readOnly
                    value={isEditMode ? displayToField(editingMeta?.orderNo) : nextOrderNo}
                    className={`${formInputClass} cursor-default bg-[#faf6f2] text-[#5f1f17]`}
                    aria-readonly="true"
                  />
                </div>
                {isEditMode ? (
                  <div>
                    <label className={formLabelClass}>Invoice no</label>
                    <input
                      type="text"
                      readOnly
                      value={editingMeta?.invoiceNumber || ''}
                      className={`${formInputClass} cursor-default bg-[#faf6f2] text-[#5f1f17]`}
                      aria-readonly="true"
                    />
                  </div>
                ) : null}
                {isEditMode ? (
                  <div className="sm:col-span-2">
                    <label className={formLabelClass}>Invoice date</label>
                    <input
                      type="text"
                      readOnly
                      value={editingMeta?.invoiceDateTime || '—'}
                      className={`${formInputClass} cursor-default bg-[#faf6f2] text-[#5f1f17]`}
                      aria-readonly="true"
                    />
                  </div>
                ) : null}
                <div>
                  <label className={formLabelClass}>Order date &amp; time</label>
                  <input
                    type="datetime-local"
                    value={draft.orderDate}
                    onChange={(e) => setDraftField('orderDate', e.target.value)}
                    className={`${formInputClass} max-w-full`}
                  />
                </div>
                <div>
                  <label className={formLabelClass}>Order status</label>
                  <input
                    type="text"
                    value={draft.orderStatus}
                    onChange={(e) => setDraftField('orderStatus', e.target.value)}
                    className={formInputClass}
                    placeholder="e.g. Delivered"
                  />
                </div>
                <div>
                  <label className={formLabelClass}>Payment status</label>
                  <input
                    type="text"
                    value={draft.paymentStatus}
                    onChange={(e) => setDraftField('paymentStatus', e.target.value)}
                    className={formInputClass}
                    placeholder="e.g. Paid"
                  />
                </div>
                <div>
                  <label className={formLabelClass}>Payment mode</label>
                  <input
                    type="text"
                    value={draft.paymentMode}
                    onChange={(e) => setDraftField('paymentMode', e.target.value)}
                    className={formInputClass}
                    placeholder="e.g. UPI / Cash / Card"
                  />
                </div>
                <div>
                  <label className={formLabelClass}>UPI ID</label>
                  <input
                    type="text"
                    value={draft.upiId}
                    onChange={(e) => setDraftField('upiId', e.target.value)}
                    className={formInputClass}
                    placeholder="e.g. merchant@paytm"
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#8f1328]">
                Bill to
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={formLabelClass}>Name</label>
                  <input
                    type="text"
                    value={draft.customerName}
                    onChange={(e) => setDraftField('customerName', e.target.value)}
                    className={formInputClass}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className={formLabelClass}>Email</label>
                  <input
                    type="email"
                    value={draft.customerEmail}
                    onChange={(e) => setDraftField('customerEmail', e.target.value)}
                    className={formInputClass}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className={formLabelClass}>Phone</label>
                  <input
                    type="text"
                    value={draft.customerPhone}
                    onChange={(e) => setDraftField('customerPhone', e.target.value)}
                    className={formInputClass}
                    placeholder="Mobile"
                  />
                </div>
                <div>
                  <label className={formLabelClass}>Address</label>
                  <textarea
                    value={draft.customerAddress}
                    onChange={(e) => setDraftField('customerAddress', e.target.value)}
                    rows={2}
                    className={`${formInputClass} resize-y`}
                    placeholder="Full address"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#8f1328]">
                  Products (Total = Discounted Price per row)
                </p>
                <button
                  type="button"
                  onClick={addDraftRow}
                  className="rounded-lg bg-[#8f0019] px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-[#730014]"
                >
                  + Add Product Row
                </button>
              </div>
              {catalogStatus === 'loading' && (
                <p className="mb-2 text-xs text-[#7a5b4f]">प्रॉडक्ट लिस्ट लोड होत आहे… / Loading product list…</p>
              )}
              {catalogStatus === 'error' && (
                <p className="mb-2 text-xs text-red-700">
                  प्रॉडक्ट लिस्ट मिळाली नाही (API तपासा). / Could not load products — check backend /{' '}
                  <code className="rounded bg-red-50 px-1">VITE_API_BASE_URL</code>.
                </p>
              )}
              <div className="space-y-3 md:hidden">
                {draft.rows.map((row, index) => {
                  const lineAmount = parseOptionalAmount(row.discountedPrice)
                  return (
                    <article
                      key={row.id}
                      className="min-w-0 rounded-xl border border-[#eadbcb] bg-[#fdfcfa] p-3"
                    >
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-[#8f1328]">
                          Product #{index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeDraftRow(row.id)}
                          disabled={draft.rows.length <= 1}
                          className="shrink-0 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-40"
                        >
                          Delete
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className={formLabelClass}>Product Name</label>
                          <select
                            value={
                              row.productId &&
                              catalogProducts.some((p) => String(p._id) === String(row.productId))
                                ? String(row.productId)
                                : ''
                            }
                            onChange={(e) => applyCatalogSelection(row.id, e.target.value)}
                            disabled={catalogStatus !== 'ok'}
                            className={formInputClass}
                          >
                            <option value="">Select product</option>
                            {catalogSorted.map((p) => {
                              const id = String(p._id)
                              const label = [p.productName, p.category].filter(Boolean).join(' · ')
                              return (
                                <option key={id} value={id}>
                                  {label || id}
                                </option>
                              )
                            })}
                          </select>
                        </div>
                        <div>
                          <label className={formLabelClass}>Category</label>
                          <input
                            type="text"
                            value={row.category}
                            onChange={(e) => updateDraftRow(row.id, 'category', e.target.value)}
                            className={formInputClass}
                            placeholder="Category"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={formLabelClass}>MRP</label>
                            <input
                              type="text"
                              inputMode="decimal"
                              autoComplete="off"
                              value={row.mrp}
                              onChange={(e) => updateDraftRow(row.id, 'mrp', e.target.value)}
                              className={formInputClass}
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className={formLabelClass}>Discounted Price</label>
                            <input
                              type="text"
                              inputMode="decimal"
                              autoComplete="off"
                              value={row.discountedPrice}
                              onChange={(e) =>
                                updateDraftRow(row.id, 'discountedPrice', e.target.value)
                              }
                              className={formInputClass}
                              placeholder="0"
                            />
                          </div>
                        </div>
                        <p className="text-sm font-mono font-semibold text-[#8f0019]">
                          Total: {lineAmount === null ? '—' : `₹${formatCurrency(lineAmount)}`}
                        </p>
                      </div>
                    </article>
                  )
                })}
              </div>

              <div className="hidden overflow-x-auto rounded-xl border border-[#eadbcb] md:block">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#eadbcb] bg-white text-[#5f1f17]">
                      <th className="px-3 py-2 font-semibold">Sr No.</th>
                      <th className="px-3 py-2 font-semibold">Product Name</th>
                      <th className="px-3 py-2 font-semibold">Category</th>
                      <th className="px-3 py-2 font-semibold">MRP</th>
                      <th className="px-3 py-2 font-semibold">Discounted Price</th>
                      <th className="px-3 py-2 font-semibold">Total</th>
                      <th className="px-3 py-2 text-center font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {draft.rows.map((row, index) => {
                      const lineAmount = parseOptionalAmount(row.discountedPrice)
                      return (
                        <tr key={row.id} className="border-t border-[#f0dfd4]">
                          <td className="px-3 py-2 align-top text-[#7a5b4f]">{index + 1}</td>
                          <td className="px-3 py-2 align-top">
                            <select
                              value={
                                row.productId &&
                                catalogProducts.some((p) => String(p._id) === String(row.productId))
                                  ? String(row.productId)
                                  : ''
                              }
                              onChange={(e) => applyCatalogSelection(row.id, e.target.value)}
                              disabled={catalogStatus !== 'ok'}
                              className={`${formInputClass} max-w-full`}
                            >
                              <option value="">Select product</option>
                              {catalogSorted.map((p) => {
                                const id = String(p._id)
                                const label = [p.productName, p.category].filter(Boolean).join(' · ')
                                return (
                                  <option key={id} value={id}>
                                    {label || id}
                                  </option>
                                )
                              })}
                            </select>
                          </td>
                          <td className="px-3 py-2 align-top">
                            <input
                              type="text"
                              value={row.category}
                              onChange={(e) => updateDraftRow(row.id, 'category', e.target.value)}
                              className={formInputClass}
                              placeholder="Category"
                            />
                          </td>
                          <td className="px-3 py-2 align-top">
                            <input
                              type="text"
                              inputMode="decimal"
                              autoComplete="off"
                              value={row.mrp}
                              onChange={(e) => updateDraftRow(row.id, 'mrp', e.target.value)}
                              className={`${formInputClass} w-28`}
                              placeholder="0"
                            />
                          </td>
                          <td className="px-3 py-2 align-top">
                            <input
                              type="text"
                              inputMode="decimal"
                              autoComplete="off"
                              value={row.discountedPrice}
                              onChange={(e) =>
                                updateDraftRow(row.id, 'discountedPrice', e.target.value)
                              }
                              className={`${formInputClass} w-28`}
                              placeholder="0"
                            />
                          </td>
                          <td className="px-3 py-2 align-middle font-mono font-semibold text-[#8f0019]">
                            {lineAmount === null ? '—' : `₹${formatCurrency(lineAmount)}`}
                          </td>
                          <td className="px-3 py-2 align-middle text-center">
                            <button
                              type="button"
                              onClick={() => removeDraftRow(row.id)}
                              disabled={draft.rows.length <= 1}
                              className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-40"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 sm:items-start">
                <div className="max-w-xs">
                  <label className={formLabelClass}>GST (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    value={draft.gstPercent}
                    onChange={(e) => setDraftField('gstPercent', e.target.value)}
                    className={formInputClass}
                    placeholder="e.g. 18"
                  />
                </div>
                <div className="rounded-xl border border-[#eadbcb] bg-[#fdfcfa] p-4 sm:ml-auto sm:max-w-sm sm:w-full">
                  <div className="space-y-2 text-sm text-[#6e4f43]">
                    <div className="flex justify-between gap-4">
                      <span>Subtotal</span>
                      <span className="font-mono font-semibold text-[#5f1f17]">
                        ₹{formatCurrency(draftTotals.subtotal)}
                      </span>
                    </div>
                    {draftTotals.gstPercent > 0 ? (
                      <div className="flex justify-between gap-4">
                        <span>GST ({draftTotals.gstPercent}%)</span>
                        <span className="font-mono font-semibold text-[#5f1f17]">
                          ₹{formatCurrency(draftTotals.gst)}
                        </span>
                      </div>
                    ) : null}
                    <div className="flex justify-between gap-4 border-t border-[#eadbcb] pt-2 text-base font-bold text-[#8f0019]">
                      <span>Grand Total</span>
                      <span className="font-mono">₹{formatCurrency(draftTotals.grandTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {formError && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{formError}</p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={isEditMode ? handleUpdateInvoice : handleGenerateInvoice}
              disabled={isSaving || loadingInvoice}
              className="rounded-xl bg-[#8f0019] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition hover:bg-[#730014] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? 'Saving…' : isEditMode ? 'Update Invoice' : 'Generate Invoice'}
            </button>
          </div>
        </div>
      </div>

      </>
      )}
    </div>
  )
}

export default InvoiceGenerator
