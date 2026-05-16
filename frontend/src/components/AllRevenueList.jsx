import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatCurrency } from '../utils/invoiceFormat'
import { invoiceViewPath } from '../utils/invoicePaths'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

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

function formatOrderDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

function rowFilterDate(row) {
  const raw = row.orderDate || row.savedAt
  if (!raw) return null
  const d = new Date(raw)
  return Number.isFinite(d.getTime()) ? d : null
}

function startOfDay(dateStr) {
  if (!dateStr) return null
  const d = new Date(`${dateStr}T00:00:00`)
  return Number.isFinite(d.getTime()) ? d : null
}

function endOfDay(dateStr) {
  if (!dateStr) return null
  const d = new Date(`${dateStr}T23:59:59.999`)
  return Number.isFinite(d.getTime()) ? d : null
}

const filterInputClass =
  'w-full rounded-lg border border-[#ddc9b5] bg-white px-3 py-2 text-sm text-[#4d2018] shadow-sm outline-none transition focus:border-[#8f0019] focus:ring-2 focus:ring-[#8f0019]/20'

function AllRevenueList({ className = '', embedded = false }) {
  const navigate = useNavigate()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDate, setFilterDate] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setListError('')
    try {
      const response = await fetch(`${API_BASE_URL}/api/revenue`)
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}))
        throw new Error(errorBody.message || 'Failed to load revenue')
      }
      const data = await response.json()
      setRecords(Array.isArray(data) ? data : [])
    } catch (error) {
      setListError(error.message || 'Could not load revenue')
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

  const filtered = useMemo(() => {
    const dayStart = startOfDay(filterDate)
    const dayEnd = endOfDay(filterDate)
    const q = searchQuery.trim().toLowerCase()

    return records.filter((row) => {
      if (dayStart && dayEnd) {
        const d = rowFilterDate(row)
        if (!d || d < dayStart || d > dayEnd) return false
      }

      if (!q) return true

      const haystack = [
        row.invoiceNumber,
        row.orderNo,
        row.customerName,
        row.customerPhone,
        row.customerEmail,
        formatSavedAt(row.savedAt),
        formatOrderDate(row.orderDate),
        row.orderDateDisplay,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [records, searchQuery, filterDate])

  const filteredTotal = useMemo(
    () => filtered.reduce((sum, row) => sum + (Number(row.grandTotal) || 0), 0),
    [filtered],
  )

  const hasActiveFilters = Boolean(searchQuery.trim() || filterDate)

  const handleViewInvoice = (row) => {
    if (!row.invoiceId) return
    navigate(
      invoiceViewPath({
        _id: row.invoiceId,
        invoiceNumber: row.invoiceNumber,
        orderNo: row.orderNo,
      }),
    )
  }

  const tableInset = 'flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-4 md:px-5 md:py-5'
  const tableBox =
    'flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#eadbcb]'

  const shellClass = embedded
    ? `flex h-full min-h-0 flex-col overflow-hidden bg-white ${className}`
    : `flex min-h-0 flex-col overflow-x-hidden rounded-2xl border border-[#eadbcb] bg-white p-4 shadow-sm md:h-full md:overflow-hidden md:p-6 ${className}`

  return (
    <section className={shellClass}>
      <div className={`shrink-0 ${embedded ? 'px-5 py-4 md:px-6 md:py-5' : ''}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="min-w-0 shrink font-serif text-xl text-[#6f1c15] md:text-2xl">All Revenue</h2>
          {!loading && !listError ? (
            <div className="flex w-full min-w-0 flex-wrap items-end justify-end gap-2 sm:w-auto">
              <div className="w-[min(100%,9.5rem)] sm:w-36">
                <label htmlFor="revenue-filter-date" className="mb-1 block text-xs font-semibold text-[#5f1f17]">
                  Date
                </label>
                <input
                  id="revenue-filter-date"
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className={filterInputClass}
                />
              </div>
              <div className="w-[min(100%,11rem)] sm:w-52">
                <label htmlFor="revenue-list-search" className="mb-1 block text-xs font-semibold text-[#5f1f17]">
                  Search
                </label>
                <input
                  id="revenue-list-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Order, customer…"
                  className={filterInputClass}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setFilterDate('')
                  }}
                  className="rounded-lg border border-[#ddc9b5] bg-white px-3 py-2 text-xs font-semibold text-[#5f1f17] shadow-sm transition hover:bg-[#f8efe7]"
                >
                  Clear
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
        {!loading && !listError && records.length > 0 ? (
          <p className="mt-2 text-sm font-semibold text-[#5f1f17]">
            {hasActiveFilters ? 'Filtered revenue' : 'Total revenue'}:{' '}
            <span className="font-mono text-[#8f0019]">₹{formatCurrency(filteredTotal)}</span>
            <span className="ml-2 font-normal text-[#7a5b4f]">
              ({filtered.length}
              {hasActiveFilters ? ` of ${records.length}` : ''} orders)
            </span>
          </p>
        ) : null}
      </div>

      {loading ? (
        <p
          className={`mt-6 shrink-0 text-sm text-[#7a5b4f] ${embedded ? 'px-4 md:px-5' : ''}`}
        >
          Loading revenue…
        </p>
      ) : listError ? (
        <p
          className={`mt-6 shrink-0 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 ${
            embedded ? 'mx-4 md:mx-5' : ''
          }`}
        >
          {listError}
        </p>
      ) : records.length === 0 ? (
        <p
          className={`mt-6 shrink-0 rounded-lg border border-dashed border-[#ddc9b5] bg-[#fdfcfa] px-4 py-8 text-center text-sm text-[#7a5b4f] ${
            embedded ? 'mx-4 md:mx-5' : ''
          }`}
        >
          No revenue yet. Generate an invoice and it will appear here.
        </p>
      ) : filtered.length === 0 ? (
        <p
          className={`mt-4 shrink-0 rounded-lg border border-dashed border-[#ddc9b5] bg-[#fdfcfa] px-4 py-8 text-center text-sm text-[#7a5b4f] ${
            embedded ? 'mx-4 md:px-5' : ''
          }`}
        >
          {hasActiveFilters
            ? 'No revenue matches the selected filters.'
            : 'No revenue matches your search.'}
        </p>
      ) : (
        <>
          <ul
            className={`mt-3 flex flex-col gap-2 md:hidden ${embedded ? 'px-4 md:px-5' : ''}`}
          >
            {filtered.map((row) => (
              <li
                key={row.id}
                className="rounded-xl border border-[#eadbcb] bg-[#fdfcfa] p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold tabular-nums text-[#8f0019]">
                      {row.invoiceNumber}
                    </p>
                    <p className="mt-0.5 truncate text-sm font-medium text-[#5f1f17]">
                      {row.customerName}
                    </p>
                    <p className="mt-0.5 text-xs text-[#6e4f43]">
                      Order {row.orderNo} · {formatOrderDate(row.orderDate)}
                    </p>
                  </div>
                  <p className="shrink-0 font-mono text-sm font-semibold text-[#5f1f17]">
                    ₹{formatCurrency(row.grandTotal)}
                  </p>
                </div>
                {row.invoiceId ? (
                  <button
                    type="button"
                    onClick={() => handleViewInvoice(row)}
                    className="mt-2 w-full rounded-md bg-[#f2e1d6] px-2 py-1.5 text-xs font-semibold text-[#5f1f17]"
                  >
                    View Invoice
                  </button>
                ) : null}
              </li>
            ))}
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
                    <th className="px-3 py-2 font-semibold">Order date</th>
                    <th className="px-3 py-2 font-semibold">Invoice No</th>
                    <th className="px-3 py-2 font-semibold">Order No</th>
                    <th className="px-3 py-2 font-semibold">Customer</th>
                    <th className="px-3 py-2 font-semibold">Email</th>
                    <th className="px-3 py-2 text-right font-semibold">Revenue</th>
                    <th className="px-3 py-2 font-semibold"> </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr key={row.id} className="border-b border-[#f0dfd4] bg-white">
                      <td className="px-3 py-2 text-[#6e4f43]">
                        {row.orderDateDisplay !== '—'
                          ? row.orderDateDisplay
                          : formatOrderDate(row.orderDate)}
                      </td>
                      <td className="px-3 py-2 font-semibold tabular-nums text-[#8f0019]">
                        {row.invoiceNumber}
                      </td>
                      <td className="px-3 py-2 tabular-nums text-[#6e4f43]">{row.orderNo}</td>
                      <td className="px-3 py-2 font-medium text-[#5f1f17]">{row.customerName}</td>
                      <td className="px-3 py-2 text-[#6e4f43]">{row.customerEmail}</td>
                      <td className="px-3 py-2 text-right font-mono font-semibold text-[#5f1f17]">
                        ₹{formatCurrency(row.grandTotal)}
                      </td>
                      <td className="px-3 py-2">
                        {row.invoiceId ? (
                          <button
                            type="button"
                            onClick={() => handleViewInvoice(row)}
                            className="rounded-md bg-[#f2e1d6] px-2 py-1 text-xs font-semibold text-[#5f1f17]"
                          >
                            View
                          </button>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  )
}

export default AllRevenueList
