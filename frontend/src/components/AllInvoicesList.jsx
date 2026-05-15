import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { invoiceViewPath } from '../utils/invoicePaths'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function formatCurrency(value) {
  const n = Number(value) || 0
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function grandTotalFromInvoice(inv) {
  if (inv?.grandTotal != null && Number.isFinite(Number(inv.grandTotal))) {
    return Number(inv.grandTotal)
  }
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

function AllInvoicesList({ className = '' }) {
  const navigate = useNavigate()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setListError('')
    try {
      const response = await fetch(`${API_BASE_URL}/api/invoices`)
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}))
        throw new Error(errorBody.message || 'Failed to load invoices')
      }
      const data = await response.json()
      setRecords(Array.isArray(data) ? data : [])
    } catch (error) {
      setListError(error.message || 'Could not load invoices')
      setRecords([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    const onChange = () => refresh()
    window.addEventListener('svarna-invoices-changed', onChange)
    return () => window.removeEventListener('svarna-invoices-changed', onChange)
  }, [refresh])

  const sorted = useMemo(() => {
    return [...records].sort((a, b) => String(b.savedAt).localeCompare(String(a.savedAt)))
  }, [records])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this invoice from the database?')) return
    try {
      const response = await fetch(`${API_BASE_URL}/api/invoices/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}))
        throw new Error(errorBody.message || 'Failed to delete invoice')
      }
      await refresh()
    } catch (error) {
      window.alert(error.message || 'Could not delete invoice')
    }
  }

  const handleDetails = (inv) => {
    navigate(invoiceViewPath(inv))
  }

  return (
    <section
      className={`flex h-full min-h-0 flex-col rounded-2xl border border-[#eadbcb] bg-white p-4 shadow-sm md:p-6 ${className}`}
    >
      <div className="shrink-0">
        <h2 className="font-serif text-2xl text-[#6f1c15]">All Invoices</h2>
        <p className="mt-1 text-sm text-[#7a5b4f]">
          Generated invoices are saved in the database. Use <strong>Details</strong> to open the full
          invoice view (print / PDF).
        </p>
      </div>

      {loading ? (
        <p className="mt-6 shrink-0 text-sm text-[#7a5b4f]">Loading invoices…</p>
      ) : listError ? (
        <p className="mt-6 shrink-0 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {listError}
        </p>
      ) : sorted.length === 0 ? (
        <p className="mt-6 shrink-0 rounded-lg border border-dashed border-[#ddc9b5] bg-[#fdfcfa] px-4 py-8 text-center text-sm text-[#7a5b4f]">
          No invoices saved yet. Generate an invoice and it will appear here.
        </p>
      ) : (
        <div className="scrollbar-hide mt-4 min-h-0 flex-1 overflow-x-auto overflow-y-auto overscroll-contain">
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
                return (
                  <tr key={rec.id} className="border-b border-[#f0dfd4] bg-white">
                    <td className="px-3 py-2 text-[#6e4f43]">{formatSavedAt(rec.savedAt)}</td>
                    <td className="px-3 py-2 font-semibold tabular-nums text-[#8f0019]">
                      {inv.invoiceNumber || '—'}
                    </td>
                    <td className="px-3 py-2 font-medium text-[#5f1f17]">{inv.customerName || '—'}</td>
                    <td className="px-3 py-2 text-[#6e4f43]">{inv.customerPhone || '—'}</td>
                    <td className="px-3 py-2 text-right font-mono font-semibold text-[#5f1f17]">
                      ₹{formatCurrency(total)}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          onClick={() => handleDetails(inv)}
                          className="rounded-md bg-[#f2e1d6] px-2 py-1 text-xs font-semibold text-[#5f1f17]"
                        >
                          Details
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
