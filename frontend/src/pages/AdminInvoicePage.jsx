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
    <main className="invoice-page-shell min-h-screen bg-[#faf7ec] px-4 py-4 md:px-6 lg:py-6">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div>
            <Link
              to="/admin/panel"
              className="text-sm font-semibold text-[#8f0019] hover:underline"
              onClick={(e) => {
                e.preventDefault()
                navigate('/admin/panel', { state: { section: 'invoice' } })
              }}
            >
              ← Back to Invoice Generator
            </Link>
            <h1 className="mt-2 font-serif text-2xl text-[#5f1f17] md:text-3xl">
              Invoice {title}
            </h1>
          </div>
          <Link
            to="/admin/panel"
            state={{ section: 'invoices-all' }}
            className="rounded-lg border border-[#8f0019] px-3 py-1.5 text-sm font-semibold text-[#8f0019] hover:bg-[#8f0019] hover:text-white"
            onClick={(e) => {
              e.preventDefault()
              navigate('/admin/panel', { state: { section: 'invoices-all' } })
            }}
          >
            All Invoices
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
          <section className="invoice-preview-wrap">
            <InvoicePreview invoice={invoice} />
          </section>
        )}
      </div>
    </main>
  )
}

export default AdminInvoicePage
