import { useCallback, useMemo, useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

/** Default logo: file `frontend/public/invoice-logo.png` (URL from site root). */
const DEFAULT_INVOICE_LOGO = `${import.meta.env.BASE_URL}invoice-logo.png`

/** Fixed company contact on invoice (not editable by user). Order: phones → email → web → address. */
const COMPANY_PHONES = ['+91 73504 95906', '+91 86686 56703']
const COMPANY_EMAIL = 'contact@svarnastudio.in'
const COMPANY_WEBSITE_LABEL = 'www.svarnastudio.in'
const COMPANY_WEBSITE_HREF = 'https://svarnastudio.in'
const COMPANY_ADDRESS_LINES = ['Ganesha Residency, Bhole Baba Nagar,', 'Uday Nagar, Nagpur']
const COMPANY_ADDRESS = COMPANY_ADDRESS_LINES.join('\n')

const DEFAULT_COMPANY_NAME = 'Svarna Studio'

/** Browser-persisted sequence: first invoice `INV-01`, then `INV-02`, … */
const INVOICE_SEQ_STORAGE_KEY = 'svarna_invoice_sequence'

function getNextInvoiceNumberString() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return 'INV-01'
  }
  try {
    const raw = window.localStorage.getItem(INVOICE_SEQ_STORAGE_KEY)
    const prev = raw ? parseInt(raw, 10) : 0
    const next = Number.isFinite(prev) && prev >= 0 ? prev + 1 : 1
    window.localStorage.setItem(INVOICE_SEQ_STORAGE_KEY, String(next))
    return `INV-${String(next).padStart(2, '0')}`
  } catch {
    return `INV-${Date.now()}`
  }
}

const createRowId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `row-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

const createEmptyRow = () => ({
  id: createRowId(),
  name: '',
  category: '',
  mrp: 0,
  discountedPrice: 0,
})

function formatInvoiceDateTime(d) {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
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
  rows: [createEmptyRow()],
})

function formatCurrency(value) {
  const n = Number(value) || 0
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function InvoiceGenerator() {
  const invoiceRef = useRef(null)
  const [draft, setDraft] = useState(initialDraft)
  const [generated, setGenerated] = useState(null)
  const [formError, setFormError] = useState('')
  const [isPdfLoading, setIsPdfLoading] = useState(false)

  const setDraftField = useCallback((key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }, [])

  const updateDraftRow = useCallback((id, field, value) => {
    setDraft((prev) => ({
      ...prev,
      rows: prev.rows.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]:
                field === 'name' || field === 'category'
                  ? value
                  : field === 'mrp' || field === 'discountedPrice'
                    ? value === ''
                      ? ''
                      : Number(value)
                    : value,
            }
          : row,
      ),
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

  const handleGenerateInvoice = () => {
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

    const now = new Date()
    const invoiceNumber = getNextInvoiceNumberString()
    const orderDateDisplay = draft.orderDate.trim()
      ? formatInvoiceDateTime(new Date(draft.orderDate))
      : '—'

    setGenerated({
      companyName: DEFAULT_COMPANY_NAME,
      logoDataUrl: draft.logoDataUrl || DEFAULT_INVOICE_LOGO,
      companyPhones: [...COMPANY_PHONES],
      companyEmail: COMPANY_EMAIL,
      companyAddress: COMPANY_ADDRESS,
      customerName: draft.customerName.trim(),
      customerEmail: draft.customerEmail.trim(),
      customerPhone: draft.customerPhone.trim(),
      customerAddress: draft.customerAddress.trim(),
      invoiceDateTime: formatInvoiceDateTime(now),
      orderNo: draft.orderNo.trim() || '—',
      invoiceNumber,
      orderDateDisplay,
      orderStatus: draft.orderStatus.trim() || '—',
      paymentStatus: draft.paymentStatus.trim() || '—',
      paymentMode: draft.paymentMode.trim() || '—',
      rows: productRows.map((r) => ({
        id: r.id,
        name: String(r.name).trim(),
        category: String(r.category || '').trim(),
        mrp: Number(r.mrp) || 0,
        discountedPrice: Number(r.discountedPrice) || 0,
      })),
    })
    setTimeout(() => {
      invoiceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  /** Row total = discounted price only (no quantity). */
  const subtotal = useMemo(() => {
    if (!generated) return 0
    return generated.rows.reduce((sum, row) => sum + (Number(row.discountedPrice) || 0), 0)
  }, [generated])

  const gst = useMemo(() => subtotal * 0.18, [subtotal])
  const grandTotal = useMemo(() => subtotal + gst, [subtotal, gst])

  const handlePrint = () => {
    if (!generated) return
    window.print()
  }

  const handleDownloadPdf = async () => {
    const node = invoiceRef.current
    if (!node || !generated) return
    setIsPdfLoading(true)
    try {
      const canvas = await html2canvas(node, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 8
      const maxW = pageWidth - margin * 2
      const maxH = pageHeight - margin * 2
      let imgW = maxW
      let imgH = (canvas.height * imgW) / canvas.width
      if (imgH > maxH) {
        imgH = maxH
        imgW = (canvas.width * imgH) / canvas.height
      }
      const x = (pageWidth - imgW) / 2
      const y = margin
      pdf.addImage(imgData, 'PNG', x, y, imgW, imgH)
      const safeName = generated.invoiceNumber.replace(/[^a-zA-Z0-9-_]/g, '_')
      pdf.save(`${safeName}.pdf`)
    } catch (e) {
      console.error(e)
      window.alert('Could not generate PDF. Please try again.')
    } finally {
      setIsPdfLoading(false)
    }
  }

  const formInputClass =
    'w-full rounded-lg border border-[#ddc9b5] bg-white px-3 py-2 text-sm text-[#4d2018] shadow-sm outline-none transition focus:border-[#8f0019] focus:ring-2 focus:ring-[#8f0019]/20'

  const formLabelClass =
    'mb-1 block text-xs font-semibold uppercase tracking-wide text-[#5f1f17]'

  return (
    <div className="rounded-2xl border border-[#eadbcb] bg-white p-4 shadow-md md:p-6">
      <div className="mb-6 print:hidden">
        <h2 className="font-serif text-2xl font-semibold text-[#5f1f17] md:text-3xl">
          Invoice Generator
        </h2>
        <p className="mt-1 text-sm text-[#7a5b4f]">
          ग्राहक, ऑर्डर तपशील व products भरा, नंतर <strong>Generate Invoice</strong>. Invoice date, invoice
          number व company contact आपोआप येतील.
        </p>
      </div>

      {/* —— Entry form —— */}
      <div className="print:hidden">
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
                      const lineTotal = Number(row.discountedPrice) || 0
                      return (
                        <tr key={row.id} className="border-t border-[#f0dfd4]">
                          <td className="px-3 py-2 align-top text-[#7a5b4f]">{index + 1}</td>
                          <td className="px-3 py-2 align-top">
                            <input
                              type="text"
                              value={row.name}
                              onChange={(e) => updateDraftRow(row.id, 'name', e.target.value)}
                              className={formInputClass}
                              placeholder="Product name"
                            />
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
                              type="number"
                              min="0"
                              step="0.01"
                              value={row.mrp}
                              onChange={(e) => updateDraftRow(row.id, 'mrp', e.target.value)}
                              className={`${formInputClass} w-28`}
                            />
                          </td>
                          <td className="px-3 py-2 align-top">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={row.discountedPrice}
                              onChange={(e) =>
                                updateDraftRow(row.id, 'discountedPrice', e.target.value)
                              }
                              className={`${formInputClass} w-28`}
                            />
                          </td>
                          <td className="px-3 py-2 align-middle font-mono font-semibold text-[#8f0019]">
                            ₹{formatCurrency(lineTotal)}
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
              className="rounded-xl bg-[#8f0019] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition hover:bg-[#730014]"
            >
              Generate Invoice
            </button>
            {generated && (
              <button
                type="button"
                onClick={handleGenerateInvoice}
                className="rounded-xl border border-[#8f0019] bg-white px-6 py-3 text-sm font-semibold text-[#8f0019] shadow-sm transition hover:bg-[#8f0019] hover:text-white"
              >
                Update invoice from form
              </button>
            )}
          </div>
        </div>
      </div>

      {generated && (
        <div className="mb-4 mt-8 flex flex-col gap-3 print:hidden sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-[#5f1f17]">Print किंवा PDF download करा.</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="rounded-xl border border-[#8f0019] bg-white px-4 py-2 text-sm font-semibold text-[#8f0019] shadow-sm transition hover:bg-[#8f0019] hover:text-white"
            >
              Print Invoice
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isPdfLoading}
              className="rounded-xl bg-[#8f0019] px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-[#730014] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPdfLoading ? 'Preparing PDF…' : 'Download PDF'}
            </button>
          </div>
        </div>
      )}

      {!generated && (
        <div className="print:hidden mt-8 rounded-2xl border border-dashed border-[#ddc9b5] bg-white px-6 py-12 text-center text-[#7a5b4f]">
          <p className="text-base font-medium">Invoice अजून generate झाले नाही.</p>
          <p className="mt-1 text-sm">Form भरून &quot;Generate Invoice&quot; वर क्लिक करा.</p>
        </div>
      )}

      {generated && (
        <div
          ref={invoiceRef}
          id="invoice-print-area"
          className="mt-4 overflow-hidden rounded-2xl border border-[#eadbcb] bg-white px-8 shadow-lg sm:px-12 md:px-16 lg:px-20 print:px-12"
        >
          {/* Top: centered logo, contact line below */}
          <div className="border-b border-[#f0dfd4] bg-white px-0 pt-1.5 pb-5 font-sans md:pt-2 md:pb-6">
            <div className="flex flex-col items-center gap-3">
              <img
                src={generated.logoDataUrl}
                alt="Company logo"
                crossOrigin="anonymous"
                className="mx-auto block h-24 w-auto max-w-[min(100%,320px)] object-contain object-center sm:h-28 md:h-32 lg:h-36"
              />
              <p className="max-w-4xl px-2 text-center text-xs leading-snug text-neutral-800 sm:px-3 sm:text-sm md:px-4">
                <span className="inline font-medium whitespace-normal">
                  {generated.companyPhones.map((phone, i) => (
                    <span key={phone}>
                      {i > 0 ? (
                        <span className="text-neutral-400" aria-hidden>
                          {' '}
                          |{' '}
                        </span>
                      ) : null}
                      <a
                        href={`tel:${phone.replace(/\s/g, '')}`}
                        className="hover:text-[#8f0019]"
                      >
                        {phone}
                      </a>
                    </span>
                  ))}
                </span>
                <span className="text-neutral-400" aria-hidden>
                  {' '}
                  |{' '}
                </span>
                <a
                  href={`mailto:${generated.companyEmail}`}
                  className="inline font-medium underline decoration-neutral-300 underline-offset-2 hover:text-[#8f0019]"
                >
                  {generated.companyEmail}
                </a>
                <span className="text-neutral-400" aria-hidden>
                  {' '}
                  |{' '}
                </span>
                <span className="inline text-neutral-800">
                  {String(generated.companyAddress || '')
                    .split('\n')
                    .map((l) => l.trim())
                    .filter(Boolean)
                    .join(' ')}
                </span>
              </p>
            </div>
          </div>

          {/* INVOICE & ORDER + BILL TO — flat (no card box) */}
          <div className="border-b border-neutral-200 px-0 pb-2 pt-5 font-sans md:pb-3 md:pt-6">
            <div className="mx-auto grid max-w-5xl gap-2 sm:grid-cols-2 sm:items-start sm:gap-4">
              <div className="min-w-0 px-1 sm:px-2">
                <h3 className="mb-1.5 text-left text-sm font-bold uppercase tracking-wide text-slate-800">
                  Invoice &amp; order
                </h3>
                <div className="flex flex-col text-sm text-slate-800">
                  <div className="flex items-baseline justify-between gap-1.5 border-b border-neutral-100 py-1 first:pt-0">
                    <span className="shrink-0 text-slate-600">Invoice Date</span>
                    <span className="min-w-0 max-w-[58%] text-right font-medium text-slate-900">
                      {generated.invoiceDateTime || '—'}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-1.5 border-b border-neutral-100 py-1">
                    <span className="shrink-0 text-slate-600">Order No</span>
                    <span className="min-w-0 max-w-[58%] text-right font-medium text-slate-900">
                      {generated.orderNo || '—'}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-1.5 border-b border-neutral-100 py-1">
                    <span className="shrink-0 text-slate-600">Invoice No</span>
                    <span className="min-w-0 max-w-[58%] text-right font-semibold tabular-nums text-slate-900">
                      {generated.invoiceNumber}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-1.5 border-b border-neutral-100 py-1">
                    <span className="shrink-0 text-slate-600">Order Date</span>
                    <span className="min-w-0 max-w-[58%] text-right font-medium text-slate-900">
                      {generated.orderDateDisplay || '—'}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-1.5 border-b border-neutral-100 py-1">
                    <span className="shrink-0 text-slate-600">Order Status</span>
                    <span className="min-w-0 max-w-[58%] text-right font-medium text-slate-900">
                      {generated.orderStatus || '—'}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-1.5 border-b border-neutral-100 py-1">
                    <span className="shrink-0 text-slate-600">Payment Status</span>
                    <span className="min-w-0 max-w-[58%] text-right font-medium text-slate-900">
                      {generated.paymentStatus || '—'}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-1.5 py-1 last:pb-0">
                    <span className="shrink-0 text-slate-600">Payment Mode</span>
                    <span className="min-w-0 max-w-[58%] text-right font-medium text-slate-900">
                      {generated.paymentMode || '—'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="min-w-0 px-1 sm:px-2">
                <h3 className="mb-1.5 text-left text-sm font-bold uppercase tracking-wide text-slate-800">
                  Bill to
                </h3>
                <div className="flex flex-col text-sm text-slate-800">
                  <div className="flex items-baseline justify-between gap-1.5 border-b border-neutral-100 py-1 first:pt-0">
                    <span className="shrink-0 text-slate-600">Name</span>
                    <span className="min-w-0 max-w-[62%] text-right font-medium text-slate-900">
                      {generated.customerName || '—'}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-1.5 border-b border-neutral-100 py-1">
                    <span className="shrink-0 text-slate-600">Email</span>
                    <span className="min-w-0 max-w-[62%] break-all text-right font-medium text-slate-900">
                      {generated.customerEmail ? (
                        <a
                          href={`mailto:${generated.customerEmail}`}
                          className="text-slate-900 underline decoration-slate-300 underline-offset-2 hover:text-slate-700"
                        >
                          {generated.customerEmail}
                        </a>
                      ) : (
                        '—'
                      )}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-1.5 border-b border-neutral-100 py-1">
                    <span className="shrink-0 text-slate-600">Phone</span>
                    <span className="min-w-0 max-w-[62%] text-right font-medium text-slate-900">
                      {generated.customerPhone || '—'}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-1.5 py-1 last:pb-0">
                    <span className="shrink-0 text-slate-600">Address</span>
                    <span className="min-w-0 max-w-[62%] whitespace-pre-wrap text-right font-medium text-slate-900">
                      {generated.customerAddress || '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PRODUCTS */}
          <div className="px-0 py-6 md:py-8">
            <h3 className="mb-4 border-l-4 border-[#8f0019] pl-3 font-serif text-sm font-bold uppercase tracking-wider text-[#6f1b1d]">
              PRODUCTS
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-[#5f1f17] text-[#fdf7ef]">
                    <th className="rounded-tl-lg px-3 py-3 font-semibold">Sr No.</th>
                    <th className="px-3 py-3 font-semibold">Product Name</th>
                    <th className="px-3 py-3 font-semibold">Category</th>
                    <th className="px-3 py-3 font-semibold">MRP</th>
                    <th className="px-3 py-3 font-semibold">Discounted Price</th>
                    <th className="rounded-tr-lg px-3 py-3 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {generated.rows.map((row, index) => {
                    const total = Number(row.discountedPrice) || 0
                    return (
                      <tr key={row.id} className="border-b border-[#f0dfd4] bg-white">
                        <td className="px-3 py-3 text-[#7a5b4f]">{index + 1}</td>
                        <td className="px-3 py-3 font-medium text-[#5f1f17]">{row.name}</td>
                        <td className="px-3 py-3 text-[#6e4f43]">{row.category || '—'}</td>
                        <td className="px-3 py-3 font-mono text-[#6e4f43]">₹{formatCurrency(row.mrp)}</td>
                        <td className="px-3 py-3 font-mono text-[#6e4f43]">₹{formatCurrency(row.discountedPrice)}</td>
                        <td className="px-3 py-3 font-mono font-semibold text-[#5f1f17]">
                          ₹{formatCurrency(total)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Calculations */}
          <div className="border-t border-[#f0dfd4] bg-white px-0 py-6 md:py-8">
            <div className="mx-auto max-w-md space-y-3 rounded-xl border border-[#eadbcb] bg-white p-5 shadow-sm">
              <div className="flex justify-between text-sm text-[#6e4f43]">
                <span>Subtotal</span>
                <span className="font-mono font-semibold text-[#5f1f17]">₹{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-[#6e4f43]">
                <span>GST (18%)</span>
                <span className="font-mono font-semibold text-[#5f1f17]">₹{formatCurrency(gst)}</span>
              </div>
              <div className="border-t border-[#eadbcb] pt-3">
                <div className="flex justify-between text-base font-bold text-[#8f0019]">
                  <span>Grand Total</span>
                  <span className="font-mono text-lg text-[#8f0019]">₹{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          <footer className="border-t border-[#7a251b] bg-gradient-to-r from-[#8f0019] to-[#5f1f17] px-0 py-3 text-center md:py-3.5">
            <p className="text-sm font-semibold leading-snug tracking-wide text-[#f8e7dc] md:text-base">
              Thank You For Your Purchase
            </p>
            <p className="mt-1 text-xs leading-snug text-[#f4d3c5] md:text-sm">
              <a
                href={COMPANY_WEBSITE_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#f8e7dc] underline decoration-[#f4d3c5]/50 underline-offset-2 hover:text-white"
              >
                {COMPANY_WEBSITE_LABEL}
              </a>
            </p>
          </footer>
        </div>
      )}
    </div>
  )
}

export default InvoiceGenerator
