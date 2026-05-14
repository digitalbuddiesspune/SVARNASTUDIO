import { useCallback, useMemo, useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

const DEFAULT_INVOICE_LOGO =
  'https://res.cloudinary.com/dkq4kvwrr/image/upload/v1777467131/suvarnaStudiologo_cojcd7.png'

/** Fixed company contact on invoice (not editable by user). */
const COMPANY_CONTACT = '+91 73504 95906'

const DEFAULT_COMPANY_NAME = 'Svarna Studio'

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

const initialDraft = () => ({
  logoDataUrl: DEFAULT_INVOICE_LOGO,
  customerName: '',
  customerPhone: '',
  customerAddress: '',
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

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      setDraftField('logoDataUrl', DEFAULT_INVOICE_LOGO)
      return
    }
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') setDraftField('logoDataUrl', reader.result)
    }
    reader.readAsDataURL(file)
  }

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
    setGenerated({
      companyName: DEFAULT_COMPANY_NAME,
      logoDataUrl: draft.logoDataUrl || DEFAULT_INVOICE_LOGO,
      contactNumber: COMPANY_CONTACT,
      customerName: draft.customerName.trim(),
      customerPhone: draft.customerPhone.trim(),
      customerAddress: draft.customerAddress.trim(),
      rows: productRows.map((r) => ({
        id: r.id,
        name: String(r.name).trim(),
        category: String(r.category || '').trim(),
        mrp: Number(r.mrp) || 0,
        discountedPrice: Number(r.discountedPrice) || 0,
      })),
      invoiceNumber: `INV-${Date.now()}`,
      dayName: now.toLocaleDateString('en-IN', { weekday: 'long' }),
      dateString: now.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
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
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'

  const formLabelClass =
    'mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600'

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-md md:p-6">
      <div className="mb-6 print:hidden">
        <h2 className="font-serif text-2xl font-semibold text-slate-900 md:text-3xl">
          Invoice Generator
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Customer व products भरा, नंतर <strong>Generate Invoice</strong>. Day, Date, Contact व Invoice
          number आपोआप येतील.
        </p>
      </div>

      {/* —— Entry form —— */}
      <div className="print:hidden">
        <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-md md:p-8">
          <h3 className="border-b border-slate-100 pb-3 text-lg font-bold text-blue-800">
            Invoice details
          </h3>

          <div className="mt-6 grid gap-6">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Logo (optional)
              </p>
              <label className="relative inline-flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-blue-200 bg-slate-50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
                <img
                  src={draft.logoDataUrl}
                  alt="Logo preview"
                  crossOrigin="anonymous"
                  className="h-full w-full object-contain p-1"
                />
              </label>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Bill to (ग्राहक)
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={formLabelClass}>Customer Name :</label>
                  <input
                    type="text"
                    value={draft.customerName}
                    onChange={(e) => setDraftField('customerName', e.target.value)}
                    className={formInputClass}
                    placeholder="Full name"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={formLabelClass}>Mobile Number :</label>
                  <input
                    type="text"
                    value={draft.customerPhone}
                    onChange={(e) => setDraftField('customerPhone', e.target.value)}
                    className={formInputClass}
                    placeholder="Mobile"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={formLabelClass}>Address :</label>
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
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Products (Total = Discounted Price per row)
                </p>
                <button
                  type="button"
                  onClick={addDraftRow}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-blue-700"
                >
                  + Add Product Row
                </button>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700">
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
                        <tr key={row.id} className="border-t border-slate-100">
                          <td className="px-3 py-2 align-top text-slate-500">{index + 1}</td>
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
                          <td className="px-3 py-2 align-middle font-mono font-semibold text-blue-800">
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
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition hover:bg-blue-700"
            >
              Generate Invoice
            </button>
            {generated && (
              <button
                type="button"
                onClick={handleGenerateInvoice}
                className="rounded-xl border border-blue-600 bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-50"
              >
                Update invoice from form
              </button>
            )}
          </div>
        </div>
      </div>

      {generated && (
        <div className="mb-4 mt-8 flex flex-col gap-3 print:hidden sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-slate-700">Print किंवा PDF download करा.</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="rounded-xl border border-blue-600 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50"
            >
              Print Invoice
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isPdfLoading}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPdfLoading ? 'Preparing PDF…' : 'Download PDF'}
            </button>
          </div>
        </div>
      )}

      {!generated && (
        <div className="print:hidden mt-8 rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center text-slate-500">
          <p className="text-base font-medium">Invoice अजून generate झाले नाही.</p>
          <p className="mt-1 text-sm">Form भरून &quot;Generate Invoice&quot; वर क्लिक करा.</p>
        </div>
      )}

      {generated && (
        <div
          ref={invoiceRef}
          id="invoice-print-area"
          className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg"
        >
          {/* Center top: logo → company → INVOICE */}
          <div className="border-b border-slate-100 bg-gradient-to-b from-blue-50/80 to-white px-6 py-8 text-center md:px-10 md:py-10">
            <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-md">
              <img
                src={generated.logoDataUrl}
                alt="Company logo"
                crossOrigin="anonymous"
                className="h-full w-full object-contain p-2"
              />
            </div>
            <p className="mt-4 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              {generated.companyName}
            </p>
            <h1 className="mt-3 text-5xl font-black tracking-tight text-blue-700 md:text-6xl">
              INVOICE
            </h1>

            {/* 3 columns: Day | Date | Contact — all auto / fixed */}
            <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-4 border-t border-slate-200 pt-8 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-100 bg-white/90 px-4 py-3 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Day</p>
                <p className="mt-1 text-base font-semibold text-slate-900">{generated.dayName}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-white/90 px-4 py-3 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Date</p>
                <p className="mt-1 text-base font-semibold text-slate-900">{generated.dateString}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-white/90 px-4 py-3 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Contact No
                </p>
                <p className="mt-1 text-base font-semibold text-slate-900">{generated.contactNumber}</p>
              </div>
            </div>

            <p className="mt-6 font-mono text-sm font-semibold text-blue-800 md:text-base">
              Invoice Number : <span className="text-lg">{generated.invoiceNumber}</span>
            </p>
          </div>

          {/* BILL TO */}
          <div className="border-b border-slate-100 px-6 py-6 md:px-10">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-blue-800">
              BILL TO
            </h3>
            <div className="space-y-2 text-sm leading-7 text-slate-800 md:text-base">
              <p>
                <span className="font-semibold text-slate-600">Customer Name :</span>{' '}
                {generated.customerName || '—'}
              </p>
              <p>
                <span className="font-semibold text-slate-600">Mobile Number :</span>{' '}
                {generated.customerPhone || '—'}
              </p>
              <p>
                <span className="font-semibold text-slate-600">Address :</span>{' '}
                <span className="whitespace-pre-wrap">
                  {generated.customerAddress || '—'}
                </span>
              </p>
            </div>
          </div>

          {/* PRODUCTS */}
          <div className="px-6 py-6 md:px-10">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-blue-800">
              PRODUCTS
            </h3>
            <div className="-mx-6 overflow-x-auto md:mx-0">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-800 text-white">
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
                      <tr key={row.id} className="border-b border-slate-100 odd:bg-slate-50/90">
                        <td className="px-3 py-3 text-slate-600">{index + 1}</td>
                        <td className="px-3 py-3 font-medium text-slate-900">{row.name}</td>
                        <td className="px-3 py-3 text-slate-700">{row.category || '—'}</td>
                        <td className="px-3 py-3 font-mono">₹{formatCurrency(row.mrp)}</td>
                        <td className="px-3 py-3 font-mono">₹{formatCurrency(row.discountedPrice)}</td>
                        <td className="px-3 py-3 font-mono font-semibold text-slate-900">
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
          <div className="border-t border-slate-100 bg-slate-50 px-6 py-6 md:px-10">
            <div className="mx-auto max-w-md space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono font-semibold text-slate-900">₹{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>GST (18%)</span>
                <span className="font-mono font-semibold text-slate-900">₹{formatCurrency(gst)}</span>
              </div>
              <div className="border-t border-slate-200 pt-3">
                <div className="flex justify-between text-base font-bold text-blue-800">
                  <span>Grand Total</span>
                  <span className="font-mono text-lg">₹{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          <footer className="border-t border-slate-100 bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-5 text-center md:px-10">
            <p className="text-sm font-semibold tracking-wide text-white md:text-base">
              Thank You For Your Purchase
            </p>
            <p className="mt-1 text-xs text-blue-100">
              {generated.companyName} · Computer-generated invoice.
            </p>
          </footer>
        </div>
      )}
    </div>
  )
}

export default InvoiceGenerator
