import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { invoiceEditPath, invoiceViewPath } from '../utils/invoicePaths'
import { invoiceTotals } from '../utils/invoiceFormat'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function formatCurrency(value) {
  const n = Number(value) || 0
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function grandTotalFromInvoice(inv) {
  return invoiceTotals(inv).grandTotal
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

function AllInvoicesList({ className = '', embedded = false }) {
  const navigate = useNavigate()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

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

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return sorted
    return sorted.filter((rec) => {
      const inv = rec.invoice || {}
      const haystack = [
        inv.invoiceNumber,
        inv.orderNo,
        inv.customerName,
        inv.customerPhone,
        inv.customerEmail,
        formatSavedAt(rec.savedAt),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [sorted, searchQuery])

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

  const handleEdit = (rec) => {
    navigate(invoiceEditPath(rec.id))
  }

  const tableInset = 'flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-4 md:px-5 md:py-5'
  const tableBox =
    'flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#eadbcb]'

  const shellClass = embedded
    ? `flex h-full min-h-0 flex-col overflow-hidden bg-white ${className}`
    : `flex min-h-0 flex-col overflow-x-hidden rounded-2xl border border-[#eadbcb] bg-white p-4 shadow-sm md:h-full md:overflow-hidden md:p-6 ${className}`

  return (
    <section className={shellClass}>
      <div
        className={`shrink-0 ${embedded ? 'px-5 py-4 md:px-6 md:py-5' : ''}`}
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="min-w-0 shrink font-serif text-xl text-[#6f1c15] md:text-2xl">All Invoices</h2>
          {!loading && !listError ? (
            <div className="w-[min(100%,11rem)] shrink-0 sm:w-52 md:w-60">
              <label htmlFor="invoice-list-search" className="sr-only">
                Search invoices
              </label>
              <input
                id="invoice-list-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search invoice, customer…"
                className="w-full rounded-lg border border-[#ddc9b5] bg-white px-3 py-2 text-sm text-[#4d2018] shadow-sm outline-none transition placeholder:text-[#a88b7a] focus:border-[#8f0019] focus:ring-2 focus:ring-[#8f0019]/20"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          ) : null}
        </div>
      </div>

      {loading ? (
        <p
          className={`mt-6 shrink-0 text-sm text-[#7a5b4f] ${embedded ? 'px-4 md:px-5' : ''}`}
        >
          Loading invoices…
        </p>
      ) : listError ? (
        <p
          className={`mt-6 shrink-0 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 ${
            embedded ? 'mx-4 md:mx-5' : ''
          }`}
        >
          {listError}
        </p>
      ) : sorted.length === 0 ? (
        <p
          className={`mt-6 shrink-0 rounded-lg border border-dashed border-[#ddc9b5] bg-[#fdfcfa] px-4 py-8 text-center text-sm text-[#7a5b4f] ${
            embedded ? 'mx-4 md:mx-5' : ''
          }`}
        >
          No invoices saved yet. Generate an invoice and it will appear here.
        </p>
      ) : filtered.length === 0 ? (
        <p
          className={`mt-4 shrink-0 rounded-lg border border-dashed border-[#ddc9b5] bg-[#fdfcfa] px-4 py-8 text-center text-sm text-[#7a5b4f] ${
            embedded ? 'mx-4 md:mx-5' : ''
          }`}
        >
          No invoices match &quot;{searchQuery.trim()}&quot;.
        </p>
      ) : (
        <>
          <ul
            className={`mt-3 flex flex-col gap-2 md:hidden ${embedded ? 'px-4 md:px-5' : ''}`}
          >
            {filtered.map((rec) => {
              const inv = rec.invoice || {}
              const total = grandTotalFromInvoice(inv)
              return (
                <li
                  key={rec.id}
                  className="rounded-xl border border-[#eadbcb] bg-[#fdfcfa] p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold tabular-nums text-[#8f0019]">
                        {inv.invoiceNumber || '—'}
                      </p>
                      <p className="mt-0.5 truncate text-sm font-medium text-[#5f1f17]">
                        {inv.customerName || '—'}
                      </p>
                      <p className="mt-0.5 text-xs text-[#6e4f43]">
                        {inv.customerPhone || '—'} · {formatSavedAt(rec.savedAt)}
                      </p>
                    </div>
                    <p className="shrink-0 font-mono text-sm font-semibold text-[#5f1f17]">
                      ₹{formatCurrency(total)}
                    </p>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleDetails(inv)}
                      className="flex-1 rounded-md bg-[#f2e1d6] px-2 py-1.5 text-xs font-semibold text-[#5f1f17]"
                    >
                      Details
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEdit(rec)}
                      className="flex-1 rounded-md bg-[#e8f0e8] px-2 py-1.5 text-xs font-semibold text-[#2d5a2d]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(rec.id)}
                      className="flex-1 rounded-md bg-[#ffe0e0] px-2 py-1.5 text-xs font-semibold text-[#8f0019]"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>

          <div className={embedded ? tableInset : 'mt-4 flex min-h-0 flex-1 flex-col'}>
          <div
            className={`scrollbar-hide hidden min-h-0 flex-1 overflow-y-auto overscroll-contain md:block ${
              embedded ? tableBox : ''
            }`}
          >
          <table className="w-full border-collapse text-left text-sm">
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
              {filtered.map((rec) => {
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
                          onClick={() => handleEdit(rec)}
                          className="rounded-md bg-[#e8f0e8] px-2 py-1 text-xs font-semibold text-[#2d5a2d]"
                        >
                          Edit
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
          </div>
        </>
      )}
    </section>
  )
}

export default AllInvoicesList
