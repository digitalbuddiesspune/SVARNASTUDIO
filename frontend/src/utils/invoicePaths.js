/** Admin route to view a saved invoice (prefers order no when set). */
export function invoiceViewPath(invoice) {
  const orderNo = String(invoice?.orderNo || '').trim()
  if (orderNo && orderNo !== '—') {
    return `/admin/invoice/order/${encodeURIComponent(orderNo)}`
  }
  const invoiceNumber = String(invoice?.invoiceNumber || '').trim()
  return `/admin/invoice/${encodeURIComponent(invoiceNumber)}`
}
