import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import QRCode from 'qrcode'
import {
  COMPANY_WEBSITE_HREF,
  COMPANY_WEBSITE_LABEL,
  DEFAULT_COMPANY_NAME,
  formatCurrency,
  formatRupeeCell,
  invoiceTotals,
} from '../utils/invoiceFormat'

/** Fixed layout width (matches PDF capture) — scaled down on narrow screens, layout unchanged. */
const INVOICE_LAYOUT_WIDTH = 794
const MOBILE_FIT_ONE_SCREEN_MQ = '(max-width: 767px)'

function InvoicePreview({ invoice, className = '' }) {
  const invoiceRef = useRef(null)
  const scaleShellRef = useRef(null)
  const [isPdfLoading, setIsPdfLoading] = useState(false)
  const [upiQrDataUrl, setUpiQrDataUrl] = useState('')
  const [viewportScale, setViewportScale] = useState(1)
  const [scaledWrapHeight, setScaledWrapHeight] = useState(null)

  const { subtotal, gst, grandTotal, gstPercent } = useMemo(() => invoiceTotals(invoice), [invoice])

  useEffect(() => {
    let cancelled = false
    async function buildUpiQr() {
      if (!invoice?.upiId?.trim()) {
        setUpiQrDataUrl('')
        return
      }
      const pa = invoice.upiId.trim()
      const pn = String(invoice.companyName || DEFAULT_COMPANY_NAME).slice(0, 50)
      const tn = `Invoice ${invoice.invoiceNumber || ''}`.slice(0, 80)
      const uri = `upi://pay?pa=${encodeURIComponent(pa)}&pn=${encodeURIComponent(pn)}&am=${grandTotal.toFixed(2)}&cu=INR&tn=${encodeURIComponent(tn)}`
      try {
        const dataUrl = await QRCode.toDataURL(uri, {
          width: 200,
          margin: 1,
          color: { dark: '#1f2937', light: '#ffffff' },
        })
        if (!cancelled) setUpiQrDataUrl(dataUrl)
      } catch (e) {
        console.error('UPI QR', e)
        if (!cancelled) setUpiQrDataUrl('')
      }
    }
    buildUpiQr()
    return () => {
      cancelled = true
    }
  }, [invoice, grandTotal])

  const updateViewportScale = useCallback(() => {
    const shell = scaleShellRef.current
    const node = invoiceRef.current
    if (!shell || !node) return

    const shellW = shell.getBoundingClientRect().width
    const widthScale = shellW / INVOICE_LAYOUT_WIDTH
    const invoiceH = node.offsetHeight || 1

    let scale = Math.min(1, widthScale)

    if (window.matchMedia(MOBILE_FIT_ONE_SCREEN_MQ).matches) {
      const shellTop = shell.getBoundingClientRect().top
      const viewportH = window.visualViewport?.height ?? window.innerHeight
      const availableH = Math.max(160, viewportH - shellTop - 8)
      scale = Math.min(scale, availableH / invoiceH)
    }

    setViewportScale(scale)
    setScaledWrapHeight(invoiceH * scale)
  }, [])

  useEffect(() => {
    const shell = scaleShellRef.current
    const node = invoiceRef.current
    if (!shell || !node) return undefined

    updateViewportScale()
    const observer = new ResizeObserver(updateViewportScale)
    observer.observe(shell)
    observer.observe(node)
    window.addEventListener('resize', updateViewportScale)
    window.visualViewport?.addEventListener('resize', updateViewportScale)
    window.visualViewport?.addEventListener('scroll', updateViewportScale)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateViewportScale)
      window.visualViewport?.removeEventListener('resize', updateViewportScale)
      window.visualViewport?.removeEventListener('scroll', updateViewportScale)
    }
  }, [invoice, upiQrDataUrl, grandTotal, updateViewportScale])

  const handlePrint = () => {
    const node = invoiceRef.current
    if (node) {
      node.classList.add('invoice-capture-mode')
      const cleanup = () => {
        node.classList.remove('invoice-capture-mode')
        window.removeEventListener('afterprint', cleanup)
      }
      window.addEventListener('afterprint', cleanup)
    }
    window.print()
  }

  const handleDownloadPdf = async () => {
    const node = invoiceRef.current
    if (!node || !invoice) return
    setIsPdfLoading(true)
    try {
      node.classList.add('invoice-capture-mode')
      await new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      })

      const canvas = await html2canvas(node, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        foreignObjectRendering: false,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        windowWidth: 794,
      })

      node.classList.remove('invoice-capture-mode')

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 6
      const maxW = pageWidth - margin * 2
      const maxH = pageHeight - margin * 2
      let imgW = maxW
      let imgH = (canvas.height * imgW) / canvas.width
      if (imgH > maxH) {
        imgH = maxH
        imgW = (canvas.width * imgH) / canvas.height
      } else if (imgH < maxH * 0.92) {
        imgH = maxH * 0.92
        imgW = (canvas.width * imgH) / canvas.height
        if (imgW > maxW) {
          imgW = maxW
          imgH = (canvas.height * imgW) / canvas.width
        }
      }
      const x = (pageWidth - imgW) / 2
      const y = margin
      pdf.addImage(imgData, 'PNG', x, y, imgW, imgH)
      const safeName = String(invoice.invoiceNumber || 'invoice').replace(/[^a-zA-Z0-9-_]/g, '_')
      pdf.save(`${safeName}.pdf`)
    } catch (e) {
      console.error(e)
      node?.classList.remove('invoice-capture-mode')
      window.alert('Could not generate PDF. Please try again.')
    } finally {
      invoiceRef.current?.classList.remove('invoice-capture-mode')
      setIsPdfLoading(false)
    }
  }

  if (!invoice) return null

  const rowCount = (invoice.rows || []).length
  const manyRows = rowCount > 4
  const isScaledView = viewportScale < 1

  return (
    <div className={`flex min-h-0 flex-1 flex-col ${className}`}>
      <div className="mb-2 flex shrink-0 flex-wrap gap-2 print:hidden md:mb-4">
        <button
          type="button"
          onClick={handlePrint}
          className="min-w-0 flex-1 rounded-xl border border-[#8f0019] bg-white px-3 py-2 text-xs font-semibold text-[#8f0019] shadow-sm transition hover:bg-[#8f0019] hover:text-white sm:flex-none sm:px-4 sm:text-sm"
        >
          Print
        </button>
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={isPdfLoading}
          className="min-w-0 flex-1 rounded-xl bg-[#8f0019] px-3 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-[#730014] disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none sm:px-4 sm:text-sm"
        >
          {isPdfLoading ? 'PDF…' : 'Download PDF'}
        </button>
      </div>

      <div
        ref={scaleShellRef}
        className="invoice-scale-shell flex min-h-0 w-full max-w-full flex-1 items-start justify-center overflow-hidden print:overflow-visible"
      >
        <div
          className="invoice-scale-viewport mx-auto print:!mx-0 print:!h-auto print:!w-full print:!max-w-full"
          style={
            isScaledView
              ? {
                  width: INVOICE_LAYOUT_WIDTH * viewportScale,
                  height: scaledWrapHeight ?? undefined,
                  overflow: 'hidden',
                }
              : { width: '100%', maxWidth: INVOICE_LAYOUT_WIDTH }
          }
        >
          <div
            className="invoice-scale-inner print:!transform-none"
            style={
              isScaledView
                ? {
                    width: INVOICE_LAYOUT_WIDTH,
                    transform: `scale(${viewportScale})`,
                    transformOrigin: 'top left',
                  }
                : { width: INVOICE_LAYOUT_WIDTH, maxWidth: '100%', margin: '0 auto' }
            }
          >
            <div
              ref={invoiceRef}
              id="invoice-print-area"
              className={`box-border overflow-hidden rounded-2xl border border-[#eadbcb] bg-white px-10 pb-0 shadow-lg print:border-0 print:px-0 print:shadow-none ${manyRows ? 'invoice-many-rows' : ''}`}
              style={{ width: INVOICE_LAYOUT_WIDTH }}
            >
        <div className="invoice-header-block border-b border-[#f0dfd4] bg-white px-0 pt-1 pb-6 font-sans">
          <div className="flex flex-col items-center gap-2">
            <img
              src={invoice.logoDataUrl}
              alt="Company logo"
              className="invoice-logo mx-auto block h-28 w-auto max-w-[min(100%,300px)] object-contain object-center"
            />
            <div className="flex w-full max-w-full justify-center pb-1">
              <p className="invoice-contact-line max-w-full px-2 text-center text-sm leading-snug text-neutral-800 text-balance">
                <span className="font-medium">
                  {(invoice.companyPhones || []).map((phone, i) => (
                    <span key={phone}>
                      {i > 0 ? (
                        <span className="text-neutral-400" aria-hidden>
                          {' '}
                          |{' '}
                        </span>
                      ) : null}
                      <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-[#8f0019]">
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
                  href={`mailto:${invoice.companyEmail}`}
                  className="inline font-medium underline decoration-neutral-300 underline-offset-2 hover:text-[#8f0019]"
                >
                  {invoice.companyEmail}
                </a>
                <span className="text-neutral-400" aria-hidden>
                  {' '}
                  |{' '}
                </span>
                <span className="inline-flex items-start gap-1 text-neutral-800">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.75}
                    stroke="currentColor"
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#8f0019]"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                    />
                  </svg>
                  <span>
                    {String(invoice.companyAddress || '')
                      .split('\n')
                      .map((l) => l.trim())
                      .filter(Boolean)
                      .join(' ')}
                  </span>
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="invoice-details-block border-b border-neutral-200 px-0 pb-4 pt-7 font-sans">
          <div className="mx-auto grid max-w-5xl grid-cols-2 items-start gap-6">
            <div className="min-w-0 px-2">
              <h3 className="invoice-section-title mb-2 text-left text-sm font-bold uppercase tracking-wide text-slate-800">
                Invoice &amp; order
              </h3>
              <div className="flex flex-col text-sm text-slate-800">
                <div className="invoice-detail-row flex items-baseline justify-between gap-1.5 border-b border-neutral-100 py-0.5 first:pt-0">
                  <span className="shrink-0 text-slate-600">Invoice Date</span>
                  <span className="min-w-0 max-w-[58%] text-right font-medium text-slate-900">
                    {invoice.invoiceDateTime || '—'}
                  </span>
                </div>
                <div className="invoice-detail-row flex items-baseline justify-between gap-1.5 border-b border-neutral-100 py-0.5">
                  <span className="shrink-0 text-slate-600">Order No</span>
                  <span className="min-w-0 max-w-[58%] text-right font-medium text-slate-900">
                    {invoice.orderNo || '—'}
                  </span>
                </div>
                <div className="invoice-detail-row flex items-baseline justify-between gap-1.5 border-b border-neutral-100 py-0.5">
                  <span className="shrink-0 text-slate-600">Invoice No</span>
                  <span className="min-w-0 max-w-[58%] text-right font-semibold tabular-nums text-slate-900">
                    {invoice.invoiceNumber}
                  </span>
                </div>
                <div className="invoice-detail-row flex items-baseline justify-between gap-1.5 border-b border-neutral-100 py-0.5">
                  <span className="shrink-0 text-slate-600">Order Date</span>
                  <span className="min-w-0 max-w-[58%] text-right font-medium text-slate-900">
                    {invoice.orderDateDisplay || '—'}
                  </span>
                </div>
                <div className="invoice-detail-row flex items-baseline justify-between gap-1.5 border-b border-neutral-100 py-0.5">
                  <span className="shrink-0 text-slate-600">Order Status</span>
                  <span className="min-w-0 max-w-[58%] text-right font-medium text-slate-900">
                    {invoice.orderStatus || '—'}
                  </span>
                </div>
                <div className="invoice-detail-row flex items-baseline justify-between gap-1.5 border-b border-neutral-100 py-0.5">
                  <span className="shrink-0 text-slate-600">Payment Status</span>
                  <span className="min-w-0 max-w-[58%] text-right font-medium text-slate-900">
                    {invoice.paymentStatus || '—'}
                  </span>
                </div>
                <div className="invoice-detail-row flex items-baseline justify-between gap-1.5 border-b border-neutral-100 py-0.5">
                  <span className="shrink-0 text-slate-600">Payment Mode</span>
                  <span className="min-w-0 max-w-[58%] text-right font-medium text-slate-900">
                    {invoice.paymentMode || '—'}
                  </span>
                </div>
                <div className="invoice-detail-row flex items-baseline justify-between gap-1.5 py-0.5 last:pb-0">
                  <span className="shrink-0 text-slate-600">UPI ID</span>
                  <span className="min-w-0 max-w-[58%] break-all text-right font-medium text-slate-900">
                    {invoice.upiId?.trim() ? invoice.upiId.trim() : '—'}
                  </span>
                </div>
              </div>
            </div>

            <div className="min-w-0 px-2">
              <h3 className="invoice-section-title mb-2 text-left text-sm font-bold uppercase tracking-wide text-slate-800">
                Bill to
              </h3>
              <div className="flex flex-col text-sm text-slate-800">
                <div className="invoice-detail-row flex items-baseline justify-between gap-1.5 border-b border-neutral-100 py-0.5 first:pt-0">
                  <span className="shrink-0 text-slate-600">Name</span>
                  <span className="min-w-0 max-w-[62%] text-right font-medium text-slate-900">
                    {invoice.customerName || '—'}
                  </span>
                </div>
                <div className="invoice-detail-row flex items-baseline justify-between gap-1.5 border-b border-neutral-100 py-0.5">
                  <span className="shrink-0 text-slate-600">Email</span>
                  <span className="min-w-0 max-w-[62%] break-all text-right font-medium text-slate-900">
                    {invoice.customerEmail ? (
                      <a
                        href={`mailto:${invoice.customerEmail}`}
                        className="text-slate-900 underline decoration-slate-300 underline-offset-2 hover:text-slate-700"
                      >
                        {invoice.customerEmail}
                      </a>
                    ) : (
                      '—'
                    )}
                  </span>
                </div>
                <div className="invoice-detail-row flex items-baseline justify-between gap-1.5 border-b border-neutral-100 py-0.5">
                  <span className="shrink-0 text-slate-600">Phone</span>
                  <span className="min-w-0 max-w-[62%] text-right font-medium text-slate-900">
                    {invoice.customerPhone || '—'}
                  </span>
                </div>
                <div className="invoice-detail-row flex items-start justify-between gap-1.5 py-0.5 last:pb-0">
                  <span className="shrink-0 text-slate-600">Address</span>
                  <span className="min-w-0 max-w-[62%] whitespace-pre-wrap text-right font-medium text-slate-900">
                    {invoice.customerAddress || '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="invoice-products-block px-0 py-6">
          <h3 className="invoice-products-title mb-3 border-l-4 border-[#8f0019] pl-3 font-serif text-sm font-bold uppercase tracking-wider text-[#6f1b1d]">
            PRODUCTS
          </h3>
          <div className="rounded-lg border border-[#eadbcb]">
            <table className="invoice-table w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-[#5f1f17] text-[#fdf7ef]">
                  <th className="rounded-tl-lg px-3 py-2 font-semibold">Sr No.</th>
                  <th className="px-3 py-2 font-semibold">Product Name</th>
                  <th className="px-3 py-2 font-semibold">Category</th>
                  <th className="px-3 py-2 font-semibold">MRP</th>
                  <th className="px-3 py-2 font-semibold">Discounted Price</th>
                  <th className="rounded-tr-lg px-3 py-2 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {(invoice.rows || []).map((row, index) => (
                  <tr key={row.id || index} className="border-b border-[#f0dfd4] bg-white">
                    <td className="px-3 py-2 text-[#7a5b4f]">{index + 1}</td>
                    <td className="px-3 py-2 font-medium text-[#5f1f17]">{row.name}</td>
                    <td className="px-3 py-2 text-[#6e4f43]">{row.category || '—'}</td>
                    <td className="px-3 py-2 font-mono text-[#6e4f43]">{formatRupeeCell(row.mrp)}</td>
                    <td className="px-3 py-2 font-mono text-[#6e4f43]">
                      {formatRupeeCell(row.discountedPrice)}
                    </td>
                    <td className="px-3 py-2 font-mono font-semibold text-[#5f1f17]">
                      {formatRupeeCell(row.discountedPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="invoice-totals-block border-t border-[#f0dfd4] bg-white px-0 py-6">
          <div
            className={`mx-auto flex gap-6 ${
              upiQrDataUrl
                ? 'max-w-3xl flex-row items-start justify-between'
                : 'max-w-lg flex-row justify-end'
            }`}
          >
            {upiQrDataUrl ? (
              <div className="flex shrink-0 flex-col items-start">
                <p className="invoice-qr-label mb-1 text-xs font-medium text-[#6e4f43]">
                  UPI — Pay exact amount
                </p>
                <img
                  src={upiQrDataUrl}
                  alt="UPI payment QR for Grand Total"
                  className="invoice-qr-img h-40 w-40"
                  width={160}
                  height={160}
                />
                <p className="mt-2 max-w-[220px] break-all text-left font-mono text-xs text-[#5f1f17]">
                  ₹{formatCurrency(grandTotal)} · {invoice.upiId?.trim()}
                </p>
              </div>
            ) : null}
            <div
              className={`invoice-totals-card rounded-xl border border-[#eadbcb] bg-white p-4 shadow-sm ${
                upiQrDataUrl ? 'ml-auto w-[min(100%,280px)] shrink-0' : 'w-full'
              }`}
            >
              <div className="space-y-3">
                <div className="flex justify-between gap-4 text-sm text-[#6e4f43]">
                  <span>Subtotal</span>
                  <span className="font-mono font-semibold text-[#5f1f17]">₹{formatCurrency(subtotal)}</span>
                </div>
                {gstPercent > 0 ? (
                  <div className="flex justify-between gap-4 text-sm text-[#6e4f43]">
                    <span>GST ({gstPercent}%)</span>
                    <span className="font-mono font-semibold text-[#5f1f17]">₹{formatCurrency(gst)}</span>
                  </div>
                ) : null}
                <div className="border-t border-[#eadbcb] pt-3">
                  <div className="flex justify-between gap-4 text-base font-bold text-[#8f0019]">
                    <span>Grand Total</span>
                    <span className="font-mono text-lg text-[#8f0019]">₹{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="invoice-footer-block border-t border-[#7a251b] bg-gradient-to-r from-[#8f0019] to-[#5f1f17] px-0 py-3 text-center">
          <p className="text-sm font-semibold leading-snug tracking-wide text-[#f8e7dc]">
            Thank You For Your Purchase
          </p>
          <p className="mt-1 text-sm leading-snug text-[#f4d3c5]">
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
        <div className="invoice-footer-spacer h-8 bg-white" aria-hidden />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvoicePreview
