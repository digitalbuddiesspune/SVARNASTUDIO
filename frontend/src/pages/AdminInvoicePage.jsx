import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import InvoicePreview from '../components/InvoicePreview'

const ADMIN_STORAGE_KEY = 'svarna_admin_auth'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function AdminInvoicePage({ lookup = 'invoice' }) {
  const params = useParams()
  const navigate = useNavigate()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const isAuth = localStorage.getItem(ADMIN_STORAGE_KEY) === 'true'
    if (!isAuth) {
      navigate('/admin')
      return
    }

    let cancelled = false

    async function loadInvoice() {
      setLoading(true)
      setError('')
      try {
        const encoded =
          lookup === 'order'
            ? encodeURIComponent(params.orderNo || '')
            : encodeURIComponent(params.invoiceNumber || '')
        const url =
          lookup === 'order'
            ? `${API_BASE_URL}/api/invoices/order/${encoded}`
            : `${API_BASE_URL}/api/invoices/number/${encoded}`

        const response = await fetch(url)
        if (!response.ok) {
          const body = await response.json().catch(() => ({}))
          throw new Error(body.message || 'Invoice not found')
        }
        const data = await response.json()
        if (!cancelled) setInvoice(data)
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Could not load invoice')
          setInvoice(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadInvoice()
    return () => {
      cancelled = true
    }
  }, [lookup, navigate, params.invoiceNumber, params.orderNo])

  const title =
    lookup === 'order'
      ? `Order ${decodeURIComponent(params.orderNo || '')}`
      : decodeURIComponent(params.invoiceNumber || '')

  return (
    <main className="invoice-page-shell flex min-h-dvh flex-col overflow-hidden bg-[#faf7ec] px-3 py-2 md:min-h-screen md:px-6 md:py-6">
      <div className="mx-auto flex w-full min-h-0 max-w-5xl flex-1 flex-col">
        <div className="mb-2 flex shrink-0 flex-wrap items-center justify-between gap-2 print:hidden md:mb-4">
          <Link
            to="/admin/panel"
            className="text-xs font-semibold text-[#8f0019] hover:underline md:text-sm"
            onClick={(e) => {
              e.preventDefault()
              navigate('/admin/panel', { state: { section: 'invoice' } })
            }}
          >
            ← Back
          </Link>
          <h1 className="font-serif text-base font-semibold text-[#5f1f17] md:text-2xl">
            {title}
          </h1>
          <Link
            to="/admin/panel"
            state={{ section: 'invoices-all' }}
            className="rounded-lg border border-[#8f0019] px-2 py-1 text-xs font-semibold text-[#8f0019] hover:bg-[#8f0019] hover:text-white md:px-3 md:py-1.5 md:text-sm"
            onClick={(e) => {
              e.preventDefault()
              navigate('/admin/panel', { state: { section: 'invoices-all' } })
            }}
          >
            All
          </Link>
        </div>

        {loading ? (
          <p className="rounded-2xl border border-[#eadbcb] bg-white p-8 text-center text-sm text-[#7a5b4f]">
            Loading invoice…
          </p>
        ) : error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-800">
            {error}
          </p>
        ) : (
          <section className="invoice-preview-wrap flex min-h-0 flex-1 flex-col overflow-hidden">
            <InvoicePreview invoice={invoice} className="min-h-0 flex-1" />
          </section>
        )}
      </div>
    </main>
  )
}

export default AdminInvoicePage
