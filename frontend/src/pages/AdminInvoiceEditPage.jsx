import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import InvoiceGenerator from '../components/InvoiceGenerator'

const ADMIN_STORAGE_KEY = 'svarna_admin_auth'

function AdminInvoiceEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const isAuth = localStorage.getItem(ADMIN_STORAGE_KEY) === 'true'
    if (!isAuth) navigate('/admin')
  }, [navigate])

  return (
    <main className="flex min-h-dvh flex-col overflow-hidden bg-[#faf7ec] px-3 py-2 md:min-h-screen md:px-6 md:py-6">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-7xl flex-1 flex-col">
        <div className="mb-2 shrink-0 print:hidden md:mb-4">
          <Link
            to="/admin/panel"
            className="text-xs font-semibold text-[#8f0019] hover:underline md:text-sm"
            onClick={(e) => {
              e.preventDefault()
              navigate('/admin/panel', { state: { section: 'invoices-all' } })
            }}
          >
            ← All Invoices
          </Link>
        </div>
        <InvoiceGenerator editId={id} className="min-h-0 flex-1 shadow-sm" />
      </div>
    </main>
  )
}

export default AdminInvoiceEditPage
