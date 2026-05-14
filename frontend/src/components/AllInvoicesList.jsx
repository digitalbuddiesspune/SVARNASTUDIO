import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import {
  deleteArchivedInvoice,
  loadArchivedInvoices,
} from '../utils/svarnaInvoiceArchive'

function formatCurrency(value) {
  const n = Number(value) || 0
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function grandTotalFromInvoice(inv) {
  if (!inv?.rows?.length) return 0
  const subtotal = inv.rows.reduce((s, r) => s + (Number(r.discountedPrice) || 0), 0)
  return subtotal + subtotal * 0.18
}

function formatSavedAt(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    return iso
  }
}

function AllInvoicesList() {
  const [records, setRecords] = useState(() => loadArchivedInvoices())
  const [expandedId, setExpandedId] = useState(null)

  const refresh = useCallback(() => {
    setRecords(loadArchivedInvoices())
  }, [])

  useEffect(() => {
    const onChange = () => refresh()
    window.addEventListener('svarna-invoices-changed', onChange)
    window.addEventListener('storage', onChange)
    return () => {
      window.removeEventListener('svarna-invoices-changed', onChange)
      window.removeEventListener('storage', onChange)
    }
  }, [refresh])

  const sorted = useMemo(() => {
    return [...records].sort((a, b) => String(b.savedAt).localeCompare(String(a.savedAt)))
  }, [records])

  const handleDelete = (id) => {
    if (!window.confirm('Delete this saved invoice from the list?')) return
    deleteArchivedInvoice(id)
    refresh()
    if (expandedId === id) setExpandedId(null)
  }

  return (
    <section className="rounded-2xl border border-[#eadbcb] bg-white p-4 shadow-sm md:p-6">
      <h2 className="font-serif text-2xl text-[#6f1c15]">All Invoices</h2>
      <p className="mt-1 text-sm text-[#7a5b4f]">
        Generated invoices are stored in this browser (local storage). Open{' '}
        <strong>Invoice Generate</strong> to create new ones.
      </p>

      {sorted.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-[#ddc9b5] bg-[#fdfcfa] px-4 py-8 text-center text-sm text-[#7a5b4f]">
          No invoices saved yet. Generate an invoice and it will appear here.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#eadbcb] bg-[#f8efe7] text-[#5f1f17]">
                <th className="px-3 py-2 font-semibold">Saved</th>
                <th className="px-3 py-2 font-semibold">Invoice No</th>
                <th className="px-3 py-2 font-semibold">Customer</th>
                <th className="px-3 py-2 font-semibold">Phone</th>
                <th className="px-3 py-2 font-semibold text-right">Grand total</th>
                <th className="px-3 py-2 font-semibold"> </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((rec) => {
                const inv = rec.invoice || {}
                const total = grandTotalFromInvoice(inv)
                const open = expandedId === rec.id
                return (
                  <Fragment key={rec.id}>
                    <tr className="border-b border-[#f0dfd4] bg-white">
                      <td className="px-3 py-2 text-[#6e4f43]">{formatSavedAt(rec.savedAt)}</td>
                      <td className="px-3 py-2 font-semibold tabular-nums text-[#8f0019]">
                        {inv.invoiceNumber || '—'}
                      </td>
                      <td className="px-3 py-2 font-medium text-[#5f1f17]">
                        {inv.customerName || '—'}
                      </td>
                      <td className="px-3 py-2 text-[#6e4f43]">{inv.customerPhone || '—'}</td>
                      <td className="px-3 py-2 text-right font-mono font-semibold text-[#5f1f17]">
                        ₹{formatCurrency(total)}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          <button
                            type="button"
                            onClick={() => setExpandedId(open ? null : rec.id)}
                            className="rounded-md bg-[#f2e1d6] px-2 py-1 text-xs font-semibold text-[#5f1f17]"
                          >
                            {open ? 'Hide' : 'Details'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(rec.id)}
                            className="rounded-md bg-[#ffe0e0] px-2 py-1 text-xs font-semibold text-[#8f0019]"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                    {open ? (
                      <tr className="border-b border-[#f0dfd4] bg-[#fdfcfa]">
                        <td colSpan={6} className="px-3 py-3 text-xs text-[#4d2018]">
                          <div className="grid gap-2 sm:grid-cols-2">
                            <p>
                              <span className="font-semibold text-[#5f1f17]">Invoice date:</span>{' '}
                              {inv.invoiceDateTime || '—'}
                            </p>
                            <p>
                              <span className="font-semibold text-[#5f1f17]">Order no:</span>{' '}
                              {inv.orderNo || '—'}
                            </p>
                            <p>
                              <span className="font-semibold text-[#5f1f17]">Order date:</span>{' '}
                              {inv.orderDateDisplay || '—'}
                            </p>
                            <p>
                              <span className="font-semibold text-[#5f1f17]">Payment:</span>{' '}
                              {inv.paymentStatus || '—'} · {inv.paymentMode || '—'}
                            </p>
                            <p className="sm:col-span-2">
                              <span className="font-semibold text-[#5f1f17]">Email:</span>{' '}
                              {inv.customerEmail || '—'}
                            </p>
                            <p className="sm:col-span-2 whitespace-pre-wrap">
                              <span className="font-semibold text-[#5f1f17]">Address:</span>{' '}
                              {inv.customerAddress || '—'}
                            </p>
                            <div className="sm:col-span-2">
                              <p className="font-semibold text-[#5f1f17]">Products</p>
                              <ul className="mt-1 list-inside list-disc text-[#6e4f43]">
                                {(inv.rows || []).map((r) => (
                                  <li key={r.id || r.name}>
                                    {r.name} — ₹{formatCurrency(r.discountedPrice)}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default AllInvoicesList
