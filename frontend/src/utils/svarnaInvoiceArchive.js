/** Saved invoices for admin "All Invoices" (browser localStorage). */
export const INVOICE_ARCHIVE_STORAGE_KEY = 'svarna_invoice_archive_v1'
const MAX_RECORDS = 200

function newArchiveId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `inv-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function loadArchivedInvoices() {
  if (typeof window === 'undefined' || !window.localStorage) return []
  try {
    const raw = window.localStorage.getItem(INVOICE_ARCHIVE_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * @param {Record<string, unknown>} invoice — same shape as InvoiceGenerator `generated`
 */
export function appendArchivedInvoice(invoice) {
  if (typeof window === 'undefined' || !window.localStorage) return
  try {
    const list = loadArchivedInvoices()
    const row = {
      id: newArchiveId(),
      savedAt: new Date().toISOString(),
      invoice: { ...invoice },
    }
    const next = [row, ...list].slice(0, MAX_RECORDS)
    window.localStorage.setItem(INVOICE_ARCHIVE_STORAGE_KEY, JSON.stringify(next))
    window.dispatchEvent(new CustomEvent('svarna-invoices-changed'))
  } catch (e) {
    console.error('appendArchivedInvoice', e)
  }
}

export function deleteArchivedInvoice(id) {
  if (typeof window === 'undefined' || !window.localStorage) return
  try {
    const list = loadArchivedInvoices().filter((r) => r.id !== id)
    window.localStorage.setItem(INVOICE_ARCHIVE_STORAGE_KEY, JSON.stringify(list))
    window.dispatchEvent(new CustomEvent('svarna-invoices-changed'))
  } catch (e) {
    console.error('deleteArchivedInvoice', e)
  }
}
