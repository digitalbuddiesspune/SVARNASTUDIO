import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatCurrency, parseOptionalAmount, formatRupeeCell } from '../utils/invoiceFormat'
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
  orderNo: '',
  orderDate: '',
  orderStatus: '',
  paymentStatus: '',
  paymentMode: '',
  upiId: '',
  rows: [createEmptyRow()],
})

function InvoiceGenerator({ className = '' }) {
  const navigate = useNavigate()
  const [draft, setDraft] = useState(initialDraft)
  const [formError, setFormError] = useState('')
  const [catalogProducts, setCatalogProducts] = useState([])
  const [catalogStatus, setCatalogStatus] = useState('loading')
  const [isSaving, setIsSaving] = useState(false)

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

  const handleGenerateInvoice = async () => {
    setFormError('')
    if (!draft.customerName.trim()) {
      setFormError('ग्राहकाचे नाव टाका / Please enter customer name.')
      return
    }
    const productRows = draft.rows.filter((r) => String(r.name).trim())
    if (productRows.length === 0) {
      setFormError('किमान एक प्रॉडक्ट जोडा / Add at least one product with a name.')
      return
    }

    const payload = {
      logoDataUrl: draft.logoDataUrl || DEFAULT_INVOICE_LOGO,
      companyName: DEFAULT_COMPANY_NAME,
      companyPhones: [...COMPANY_PHONES],
      companyEmail: COMPANY_EMAIL,
      companyAddress: COMPANY_ADDRESS,
      customerName: draft.customerName.trim(),
      customerEmail: draft.customerEmail.trim(),
      customerPhone: draft.customerPhone.trim(),
      customerAddress: draft.customerAddress.trim(),
      orderNo: draft.orderNo.trim(),
      orderDate: draft.orderDate.trim() || undefined,
      orderStatus: draft.orderStatus.trim(),
      paymentStatus: draft.paymentStatus.trim(),
      paymentMode: draft.paymentMode.trim(),
      upiId: draft.upiId.trim(),
      lineItems: productRows.map((r) => ({
        lineId: r.id,
        productId: r.productId || undefined,
        name: String(r.name).trim(),
        category: String(r.category || '').trim(),
        mrp: r.mrp === '' ? null : r.mrp,
        discountedPrice: r.discountedPrice === '' ? null : r.discountedPrice,
      })),
    }

    setIsSaving(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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

  const formInputClass =
    'w-full rounded-lg border border-[#ddc9b5] bg-white px-3 py-2 text-sm text-[#4d2018] shadow-sm outline-none transition focus:border-[#8f0019] focus:ring-2 focus:ring-[#8f0019]/20'

  const formLabelClass =
    'mb-1 block text-xs font-semibold uppercase tracking-wide text-[#5f1f17]'

  return (
    <div
      className={`flex h-full min-h-0 flex-col rounded-2xl border border-[#eadbcb] bg-white p-4 shadow-md md:p-6 ${className}`}
    >
      <div className="mb-6 shrink-0 print:hidden">
        <h2 className="font-serif text-2xl font-semibold text-[#5f1f17] md:text-3xl">
          Invoice Generator
        </h2>
        <p className="mt-1 text-sm text-[#7a5b4f]">
          ग्राहक, ऑर्डर तपशील व products भरा, नंतर <strong>Generate Invoice</strong>. Invoice date, invoice
          number व company contact आपोआप येतील.
        </p>
      </div>

      {/* —— Entry form —— */}
      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto overscroll-contain print:hidden">
        <div className="rounded-2xl border border-[#eadbcb] bg-white p-5 shadow-md md:p-8">
          <h3 className="border-b border-[#f0dfd4] pb-3 font-serif text-lg font-bold text-[#6f1b1d]">
            Invoice details
          </h3>

          <div className="mt-6 grid gap-6">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#8f1328]">
                Invoice &amp; order (ऑर्डर तपशील)
              </p>
              <p className="mb-3 text-xs text-[#7a5b4f]">
                Invoice date व Invoice number generate वेळी येतील. बाकी फील्ड इथे भरा.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={formLabelClass}>Order no</label>
                  <input
                    type="text"
                    value={draft.orderNo}
                    onChange={(e) => setDraftField('orderNo', e.target.value)}
                    className={formInputClass}
                    placeholder="e.g. #1017"
                  />
                </div>
                <div>
                  <label className={formLabelClass}>Order date &amp; time</label>
                  <input
                    type="datetime-local"
                    value={draft.orderDate}
                    onChange={(e) => setDraftField('orderDate', e.target.value)}
                    className={formInputClass}
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
                <div className="sm:col-span-2">
                  <label className={formLabelClass}>Payment mode</label>
                  <input
                    type="text"
                    value={draft.paymentMode}
                    onChange={(e) => setDraftField('paymentMode', e.target.value)}
                    className={formInputClass}
                    placeholder="e.g. UPI / Cash / Card"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={formLabelClass}>UPI ID (भरण्यासाठी QR)</label>
                  <input
                    type="text"
                    value={draft.upiId}
                    onChange={(e) => setDraftField('upiId', e.target.value)}
                    className={formInputClass}
                    placeholder="e.g. merchant@paytm"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <p className="mt-1.5 text-xs text-[#7a5b4f]">
                    Grand Total रकमेचा UPI QR इनव्हॉइसवर दिसेल / QR encodes the exact Grand Total (incl. 18% GST).
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#8f1328]">
                Bill to (ग्राहक)
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={formLabelClass}>Name</label>
                  <input
                    type="text"
                    value={draft.customerName}
                    onChange={(e) => setDraftField('customerName', e.target.value)}
                    className={formInputClass}
                    placeholder="Full name"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={formLabelClass}>Email</label>
                  <input
                    type="email"
                    value={draft.customerEmail}
                    onChange={(e) => setDraftField('customerEmail', e.target.value)}
                    className={formInputClass}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={formLabelClass}>Phone</label>
                  <input
                    type="text"
                    value={draft.customerPhone}
                    onChange={(e) => setDraftField('customerPhone', e.target.value)}
                    className={formInputClass}
                    placeholder="Mobile"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={formLabelClass}>Address</label>
                  <textarea
                    value={draft.customerAddress}
                    onChange={(e) => setDraftField('customerAddress', e.target.value)}
                    rows={3}
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
              <div className="overflow-x-auto rounded-xl border border-[#eadbcb]">
                <table className="w-full min-w-[720px] border-collapse text-left text-sm">
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
                          <td className="min-w-[14rem] px-3 py-2 align-top">
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
                              <option value="">— प्रॉडक्ट निवडा / Select product —</option>
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
            </div>
          </div>

          {formError && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{formError}</p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleGenerateInvoice}
              disabled={isSaving}
              className="rounded-xl bg-[#8f0019] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition hover:bg-[#730014] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? 'Saving…' : 'Generate Invoice'}
            </button>
          </div>
        </div>
      </div>


      <div className="print:hidden mt-4 shrink-0 rounded-lg border border-dashed border-[#ddc9b5] bg-[#fdfcfa] px-4 py-2.5 text-center">
        <p className="text-sm text-[#7a5b4f]">
          Form भरून &quot;Generate Invoice&quot; वर क्लिक केल्यावर full invoice पृष्ठ उघडेल.
        </p>
      </div>
    </div>
  )
}

export default InvoiceGenerator
