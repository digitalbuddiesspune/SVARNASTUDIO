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

export function gstPercentFromInvoice(invoice) {
  if (invoice?.gstPercent == null || invoice?.gstPercent === '') return 0
  const n = Number(invoice.gstPercent)
  if (!Number.isFinite(n) || n <= 0) return 0
  return Math.min(n, 100)
}

export function invoiceTotals(invoice) {
  const gstPercent = gstPercentFromInvoice(invoice)

  const subtotalFromRows = (invoice?.rows || []).reduce(
    (sum, row) => sum + (parseOptionalAmount(row.discountedPrice) ?? 0),
    0,
  )
  const subtotal =
    invoice?.subtotal != null && Number.isFinite(Number(invoice.subtotal))
      ? Number(invoice.subtotal)
      : subtotalFromRows

  if (gstPercent <= 0) {
    return { subtotal, gst: 0, grandTotal: subtotal, gstPercent: 0 }
  }

  const rate = gstPercent / 100
  const gst = subtotal * rate
  return { subtotal, gst, grandTotal: subtotal + gst, gstPercent }
}
