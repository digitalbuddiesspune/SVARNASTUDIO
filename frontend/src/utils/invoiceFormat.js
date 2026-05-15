export const DEFAULT_COMPANY_NAME = 'Svarna Studio'

export const COMPANY_WEBSITE_LABEL = 'www.svarnastudio.in'
export const COMPANY_WEBSITE_HREF = 'https://svarnastudio.in'

export function formatCurrency(value) {
  const n = Number(value) || 0
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function parseOptionalAmount(raw) {
  if (raw === null || raw === undefined) return null
  const s = String(raw).trim()
  if (s === '') return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

export function formatRupeeCell(raw) {
  const n = parseOptionalAmount(raw)
  if (n === null) return '—'
  return `₹${formatCurrency(n)}`
}

export function invoiceTotals(invoice) {
  if (invoice?.grandTotal != null && Number.isFinite(Number(invoice.grandTotal))) {
    const grandTotal = Number(invoice.grandTotal)
    const subtotal =
      invoice.subtotal != null && Number.isFinite(Number(invoice.subtotal))
        ? Number(invoice.subtotal)
        : grandTotal / 1.18
    const gst =
      invoice.gstAmount != null && Number.isFinite(Number(invoice.gstAmount))
        ? Number(invoice.gstAmount)
        : grandTotal - subtotal
    return { subtotal, gst, grandTotal }
  }
  const subtotal = (invoice?.rows || []).reduce(
    (sum, row) => sum + (parseOptionalAmount(row.discountedPrice) ?? 0),
    0,
  )
  const gst = subtotal * 0.18
  return { subtotal, gst, grandTotal: subtotal + gst }
}
