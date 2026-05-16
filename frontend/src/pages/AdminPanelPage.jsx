import InvoiceGenerator from '../components/InvoiceGenerator'
import AllInvoicesList from '../components/AllInvoicesList'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { formatCurrency } from '../utils/invoiceFormat'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
const ADMIN_STORAGE_KEY = 'svarna_admin_auth'
const ADMIN_LOGO = `${import.meta.env.BASE_URL}adminlogo.png`

const categoryOptions = [
  {
    category: 'Sarees',
    subCategories: [
      'Linen Sarees',
      'Cotton Sarees',
      'Silk Blend Sarees',
      'Embroidered Sarees',
      'Printed Sarees',
      'Festive Sarees',
    ],
  },
  {
    category: 'Kurta Sets',
    subCategories: [
      'Straight Kurta Sets',
      'A-line Kurta Sets',
      'Printed Kurta Sets',
      'Embroidered Kurta Sets',
      'Festive Kurta Sets',
      '2-Piece Sets',
      '3-Piece Sets',
    ],
  },
  {
    category: 'Co-ord Sets',
    subCategories: ['Printed Co-ord Sets', 'Casual Co-ord Sets', 'Lounge Sets', 'Office Wear Sets'],
  },
  {
    category: 'Tops',
    subCategories: ['Ethnic Tops', 'Printed Tops', 'Crop Tops'],
  },
  {
    category: 'Indo-Western',
    subCategories: ['Fusion Sets', 'Cape Sets', 'Tunic + Pants', 'Designer Indo-Western'],
  },
  {
    category: 'Collections',
    subCategories: [
      'Festive Collection',
      'Summer Linen Collection',
      'Office Wear Collection',
      'Wedding Collection',
      'Minimal Everyday Wear',
    ],
  },
]

const defaultForm = {
  productName: '',
  brand: 'Svarna Studio',
  category: categoryOptions[0].category,
  subCategory: categoryOptions[0].subCategories[0],
  fabric: '',
  occasion: '',
  details: '',
  description: '',
  styleTip: '',
  imageUrls: '',
  mrp: '',
  discountPercent: '0',
  stock: '0',
  isFeatured: false,
  isTrendingNow: false,
  isNewArrival: false,
}

/** Mobile drawer only — desktop sidebar is flush left (ADMIN_SIDEBAR). */
const ADMIN_SIDEBAR_CARD =
  'flex h-full min-h-0 flex-col rounded-none rounded-r-2xl border border-[#eadbcb] bg-white p-4 shadow-xl md:p-5'

/** Fixed left column — full viewport height, no outer margin. */
const ADMIN_SIDEBAR =
  'print:hidden hidden h-full w-[260px] shrink-0 flex-col border-r border-[#eadbcb] bg-white p-4 md:flex md:p-5'

/** Right column — fills remaining width, edge-to-edge. */
const ADMIN_MAIN =
  'flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white'

/** Page sections inside the right column. */
const ADMIN_PANEL_CARD =
  'flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-white p-5 md:p-6'

const ADMIN_PANEL_SCROLL =
  'scrollbar-hide min-h-0 flex-1 overflow-y-auto overscroll-contain pr-0.5'

const DASHBOARD_STAT_CARD =
  'w-full rounded-xl bg-[#f9ece5] p-4 text-left'

const DASHBOARD_STAT_CARD_CLICKABLE = `${DASHBOARD_STAT_CARD} cursor-pointer transition hover:bg-[#f2e0d4] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f0019]/40`

const ADMIN_TABLE_WRAP =
  'mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#eadbcb]'

function AdminSidebarHeader({ compact = false }) {
  return (
    <div className={`shrink-0 border-b border-[#f0dfd4] ${compact ? 'pb-3' : 'pb-4'}`}>
      <img
        src={ADMIN_LOGO}
        alt="Svarna Studio"
        className={`mx-auto object-contain ${compact ? 'h-12 w-auto max-w-[140px]' : 'h-16 w-auto max-w-[180px]'}`}
      />
      <h1
        className={`mt-3 text-center font-serif text-[#5f1f17] ${
          compact ? 'text-lg font-semibold' : 'text-2xl'
        }`}
      >
        Admin Panel
      </h1>
    </div>
  )
}

function AdminIcon({ children, className = 'h-5 w-5' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  )
}

const IconDashboard = ({ className }) => (
  <AdminIcon className={className}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </AdminIcon>
)

const IconProducts = ({ className }) => (
  <AdminIcon className={className}>
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    <path d="M3.3 7.7L12 12.5l8.7-4.8M12 22V12.5" />
  </AdminIcon>
)

const IconPlus = ({ className }) => (
  <AdminIcon className={className}>
    <path d="M12 5v14M5 12h14" />
  </AdminIcon>
)

const IconStar = ({ className }) => (
  <AdminIcon className={className}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
  </AdminIcon>
)

const IconLayers = ({ className }) => (
  <AdminIcon className={className}>
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </AdminIcon>
)

const IconReceipt = ({ className }) => (
  <AdminIcon className={className}>
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
  </AdminIcon>
)

const IconFileInvoice = ({ className }) => (
  <AdminIcon className={className}>
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <path d="M14 2v6h6M8 13h2M8 17h6M8 9h1" />
  </AdminIcon>
)

const IconList = ({ className }) => (
  <AdminIcon className={className}>
    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
  </AdminIcon>
)

const IconRupee = ({ className }) => (
  <AdminIcon className={className}>
    <path d="M6 3h12M6 8h8a4 4 0 010 8H6M6 21h12" />
  </AdminIcon>
)

const IconLogout = ({ className }) => (
  <AdminIcon className={className}>
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
  </AdminIcon>
)

const ADMIN_NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', Icon: IconDashboard },
  { id: 'add', label: 'Add Product', Icon: IconPlus },
  { id: 'all', label: 'All Products', Icon: IconProducts },
  { id: 'invoice', label: 'Invoice Generate', Icon: IconFileInvoice },
  { id: 'invoices-all', label: 'All Invoices', Icon: IconList },
]

function AdminSidebarNav({ activeSection, onSelectSection, onLogout, showSubtitle = true }) {
  return (
    <>
      {showSubtitle ? (
        <p className="text-center text-xs text-[#7a5b4f]">Manage products and catalog.</p>
      ) : null}
      <nav className={`flex flex-col gap-2 ${showSubtitle ? 'mt-5 lg:flex-1' : 'mt-2'}`}>
        {ADMIN_NAV_ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelectSection(id)}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
              activeSection === id
                ? 'bg-[#8f0019] text-white'
                : 'bg-[#f8efe7] text-[#5f1f17] hover:bg-[#f2dfd1]'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        ))}
      </nav>
      <button
        type="button"
        onClick={onLogout}
        className={`flex w-full items-center justify-center gap-2 rounded-lg border border-[#8f0019] px-4 py-2 text-sm font-semibold text-[#8f0019] transition hover:bg-[#8f0019] hover:text-white ${
          showSubtitle ? 'mt-4 lg:mt-auto' : 'mt-4'
        }`}
      >
        <IconLogout className="h-4 w-4" />
        Logout
      </button>
    </>
  )
}

function AdminPanelPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(defaultForm)
  const [editingId, setEditingId] = useState('')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [detailProduct, setDetailProduct] = useState(null)
  const [activeSection, setActiveSection] = useState('dashboard')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [dashboardStats, setDashboardStats] = useState({ orderCount: 0, totalRevenue: 0 })
  const [dashboardStatsLoading, setDashboardStatsLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const subCategoryOptions = useMemo(() => {
    return categoryOptions.find((item) => item.category === form.category)?.subCategories || []
  }, [form.category])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`)
      if (!response.ok) throw new Error('Failed to load products')
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      setStatus(error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchDashboardStats = async () => {
    setDashboardStatsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/revenue/dashboard`)
      if (!response.ok) throw new Error('Failed to load dashboard stats')
      const data = await response.json()
      setDashboardStats({
        orderCount: Number(data.orderCount) || 0,
        totalRevenue: Number(data.totalRevenue) || 0,
      })
    } catch (error) {
      setDashboardStats({ orderCount: 0, totalRevenue: 0 })
      setStatus(error.message)
    } finally {
      setDashboardStatsLoading(false)
    }
  }

  useEffect(() => {
    const isAuth = localStorage.getItem(ADMIN_STORAGE_KEY) === 'true'
    if (!isAuth) {
      navigate('/admin')
      return
    }
    fetchProducts()
  }, [navigate])

  useEffect(() => {
    const section = location.state?.section
    if (section) {
      setActiveSection(section)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, location.pathname, navigate])

  useEffect(() => {
    if (activeSection === 'dashboard') {
      fetchDashboardStats()
    }
  }, [activeSection])

  useEffect(() => {
    if (!mobileMenuOpen) return undefined
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [mobileMenuOpen])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const closeOnDesktop = () => {
      if (mq.matches) setMobileMenuOpen(false)
    }
    mq.addEventListener('change', closeOnDesktop)
    return () => mq.removeEventListener('change', closeOnDesktop)
  }, [])

  const selectSection = (id) => {
    setActiveSection(id)
    setMobileMenuOpen(false)
  }

  useEffect(() => {
    if (!subCategoryOptions.includes(form.subCategory)) {
      setForm((prev) => ({
        ...prev,
        subCategory: subCategoryOptions[0] || '',
      }))
    }
  }, [form.subCategory, subCategoryOptions])

  useEffect(() => {
    document.body.style.overflow = isEditModalOpen || detailProduct ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isEditModalOpen, detailProduct])

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const resetForm = () => {
    setForm(defaultForm)
    setEditingId('')
    setIsEditModalOpen(false)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus('')

    if (!form.productName.trim() || !form.category.trim() || !form.subCategory.trim()) {
      setStatus('Product name, category and subcategory are required.')
      return
    }

    const productImages = form.imageUrls
      .split(/[\n,]/)
      .map((value) => value.trim())
      .filter(Boolean)

    const payload = {
      productName: form.productName.trim(),
      brand: form.brand.trim(),
      category: form.category.trim(),
      subCategory: form.subCategory.trim(),
      fabric: form.fabric.trim(),
      occasion: form.occasion.trim(),
      details: form.details.trim(),
      description: form.description.trim(),
      styleTip: form.styleTip.trim(),
      productImages,
      stock: Number(form.stock || 0),
      isFeatured: Boolean(form.isFeatured),
      isTrendingNow: Boolean(form.isTrendingNow),
      isNewArrival: Boolean(form.isNewArrival),
      design_details: {},
      price: {
        mrp: Number(form.mrp || 0),
        discountPercent: Number(form.discountPercent || 0),
      },
    }

    try {
      const endpoint = editingId
        ? `${API_BASE_URL}/api/products/${editingId}`
        : `${API_BASE_URL}/api/products`
      const method = editingId ? 'PUT' : 'POST'
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}))
        if (response.status === 404 && editingId) {
          await fetchProducts()
          resetForm()
          setStatus('This product no longer exists. Product list has been refreshed.')
          return
        }
        throw new Error(errorBody.message || 'Failed to save product')
      }

      await fetchProducts()
      resetForm()
      setStatus(editingId ? 'Product updated successfully.' : 'Product added successfully.')
    } catch (error) {
      setStatus(error.message)
    }
  }

  const handleEdit = (product, event) => {
    event?.stopPropagation()
    setEditingId(product._id)
    setActiveSection('all')
    setIsEditModalOpen(true)
    setForm({
      productName: product.productName || '',
      brand: product.brand || 'Svarna Studio',
      category: product.category || categoryOptions[0].category,
      subCategory: product.subCategory || categoryOptions[0].subCategories[0],
      fabric: product.fabric || '',
      occasion: product.occasion || '',
      details: product.details || '',
      description: product.description || '',
      styleTip: product.styleTip || '',
      imageUrls: (product.productImages || []).join('\n'),
      mrp: String(product.price?.mrp ?? 0),
      discountPercent: String(product.price?.discountPercent ?? 0),
      stock: String(product.stock ?? 0),
      isFeatured: Boolean(product.isFeatured),
      isTrendingNow: Boolean(product.isTrendingNow),
      isNewArrival: Boolean(product.isNewArrival),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (productId, event) => {
    event?.stopPropagation()
    const shouldDelete = window.confirm('Delete this product?')
    if (!shouldDelete) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        if (response.status === 404) {
          await fetchProducts()
          if (editingId === productId) resetForm()
          setStatus('Product was already removed. List has been refreshed.')
          return
        }
        throw new Error('Failed to delete product')
      }
      await fetchProducts()
      if (editingId === productId) resetForm()
      setDetailProduct((current) => (current?._id === productId ? null : current))
      setStatus('Product deleted successfully.')
      setActiveSection('all')
    } catch (error) {
      setStatus(error.message)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_STORAGE_KEY)
    navigate('/admin')
  }

  const totalProducts = products.length
  const featuredProducts = products.filter((product) => product.isFeatured).length
  const totalCategories = new Set(products.map((product) => product.category).filter(Boolean)).size

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-[#faf7ec] lg:h-screen lg:max-h-screen lg:flex-row lg:overflow-hidden">
      {/* Mobile top bar — heading + menu button */}
      <header className="print:hidden sticky top-0 z-40 flex shrink-0 items-center justify-between gap-3 border-b border-[#eadbcb] bg-[#faf7ec]/95 px-4 py-3 backdrop-blur-sm lg:hidden">
        <h1 className="font-serif text-xl font-semibold text-[#5f1f17] sm:text-2xl">Admin Panel</h1>
        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#ddc9b5] bg-white text-[#5f1f17] shadow-sm transition hover:bg-[#f8efe7]"
          aria-expanded={mobileMenuOpen}
          aria-controls="admin-mobile-menu"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? (
            <AdminIcon className="h-5 w-5">
              <path d="M6 6l12 12M18 6L6 18" />
            </AdminIcon>
          ) : (
            <AdminIcon className="h-5 w-5">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </AdminIcon>
          )}
        </button>
      </header>

      {/* Mobile slide-out menu */}
      {mobileMenuOpen ? (
        <div className="print:hidden fixed inset-0 z-50 lg:hidden" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-[#2a1810]/40"
            aria-label="Close menu"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside
            id="admin-mobile-menu"
            className={`absolute left-0 top-0 flex h-full w-[min(100%,280px)] flex-col ${ADMIN_SIDEBAR_CARD} rounded-none rounded-r-2xl shadow-xl`}
          >
            <div className="relative mb-2">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="absolute right-0 top-0 inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#5f1f17] hover:bg-[#f8efe7]"
                aria-label="Close menu"
              >
                <AdminIcon className="h-5 w-5">
                  <path d="M6 6l12 12M18 6L6 18" />
                </AdminIcon>
              </button>
              <AdminSidebarHeader compact />
            </div>
            <AdminSidebarNav
              activeSection={activeSection}
              onSelectSection={selectSection}
              onLogout={handleLogout}
              showSubtitle={false}
            />
          </aside>
        </div>
      ) : null}

      <section className="flex min-h-0 w-full flex-1 flex-col overflow-hidden px-4 lg:flex-row lg:px-0">
        <aside className={ADMIN_SIDEBAR}>
          <AdminSidebarHeader />
          <AdminSidebarNav
            activeSection={activeSection}
            onSelectSection={selectSection}
            onLogout={handleLogout}
          />
        </aside>

        <div className={ADMIN_MAIN}>
          {activeSection === 'invoice' && (
            <InvoiceGenerator embedded className="min-h-0 flex-1" />
          )}

          {activeSection === 'invoices-all' && <AllInvoicesList embedded className="min-h-0 flex-1" />}

          {activeSection === 'dashboard' && (
            <section className={ADMIN_PANEL_CARD}>
              <h2 className="shrink-0 font-serif text-2xl text-[#6f1c15]">Dashboard</h2>
              <div className="mt-4 grid flex-1 content-start gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setActiveSection('all')}
                  className={DASHBOARD_STAT_CARD_CLICKABLE}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#8f0019]">Total Products</p>
                    <IconProducts className="h-5 w-5 text-[#8f0019]/80" />
                  </div>
                  <p className="mt-2 text-3xl font-bold text-[#5f1f17]">{loading ? '…' : totalProducts}</p>
                </button>
                <article className={DASHBOARD_STAT_CARD}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#8f0019]">Featured</p>
                    <IconStar className="h-5 w-5 text-[#8f0019]/80" />
                  </div>
                  <p className="mt-2 text-3xl font-bold text-[#5f1f17]">{loading ? '…' : featuredProducts}</p>
                </article>
                <article className={DASHBOARD_STAT_CARD}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#8f0019]">Categories</p>
                    <IconLayers className="h-5 w-5 text-[#8f0019]/80" />
                  </div>
                  <p className="mt-2 text-3xl font-bold text-[#5f1f17]">{loading ? '…' : totalCategories}</p>
                </article>
                <button
                  type="button"
                  onClick={() => setActiveSection('invoices-all')}
                  className={DASHBOARD_STAT_CARD_CLICKABLE}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#8f0019]">Order Count</p>
                    <IconReceipt className="h-5 w-5 text-[#8f0019]/80" />
                  </div>
                  <p className="mt-2 text-3xl font-bold text-[#5f1f17]">
                    {dashboardStatsLoading ? '…' : dashboardStats.orderCount}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('invoices-all')}
                  className={DASHBOARD_STAT_CARD_CLICKABLE}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#8f0019]">Revenue</p>
                    <IconRupee className="h-5 w-5 text-[#8f0019]/80" />
                  </div>
                  <p className="mt-2 text-3xl font-bold text-[#5f1f17]">
                    {dashboardStatsLoading ? '…' : `₹${formatCurrency(dashboardStats.totalRevenue)}`}
                  </p>
                </button>
              </div>
            </section>
          )}

          {activeSection === 'add' && (
            <form onSubmit={handleSubmit} className={ADMIN_PANEL_CARD}>
              <h2 className="shrink-0 font-serif text-2xl text-[#6f1c15]">Add Product</h2>

              <div className={`${ADMIN_PANEL_SCROLL} mt-4`}>
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  placeholder="Product Name *"
                  value={form.productName}
                  onChange={(event) => handleChange('productName', event.target.value)}
                  className="rounded-lg border border-[#ddc9b5] px-3 py-2 outline-none ring-[#8f0019]/30 focus:ring"
                  required
                />
                <input
                  placeholder="Brand"
                  value={form.brand}
                  onChange={(event) => handleChange('brand', event.target.value)}
                  className="rounded-lg border border-[#ddc9b5] px-3 py-2 outline-none ring-[#8f0019]/30 focus:ring"
                />
                <select
                  value={form.category}
                  onChange={(event) => handleChange('category', event.target.value)}
                  className="rounded-lg border border-[#ddc9b5] px-3 py-2 outline-none ring-[#8f0019]/30 focus:ring"
                >
                  {categoryOptions.map((item) => (
                    <option key={item.category} value={item.category}>
                      {item.category}
                    </option>
                  ))}
                </select>
                <select
                  value={form.subCategory}
                  onChange={(event) => handleChange('subCategory', event.target.value)}
                  className="rounded-lg border border-[#ddc9b5] px-3 py-2 outline-none ring-[#8f0019]/30 focus:ring"
                >
                  {subCategoryOptions.map((subCategory) => (
                    <option key={subCategory} value={subCategory}>
                      {subCategory}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="Fabric"
                  value={form.fabric}
                  onChange={(event) => handleChange('fabric', event.target.value)}
                  className="rounded-lg border border-[#ddc9b5] px-3 py-2 outline-none ring-[#8f0019]/30 focus:ring"
                />
                <input
                  placeholder="Occasion"
                  value={form.occasion}
                  onChange={(event) => handleChange('occasion', event.target.value)}
                  className="rounded-lg border border-[#ddc9b5] px-3 py-2 outline-none ring-[#8f0019]/30 focus:ring"
                />
                <input
                  type="number"
                  min="0"
                  placeholder="MRP"
                  value={form.mrp}
                  onChange={(event) => handleChange('mrp', event.target.value)}
                  className="rounded-lg border border-[#ddc9b5] px-3 py-2 outline-none ring-[#8f0019]/30 focus:ring"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Discount %"
                  value={form.discountPercent}
                  onChange={(event) => handleChange('discountPercent', event.target.value)}
                  className="rounded-lg border border-[#ddc9b5] px-3 py-2 outline-none ring-[#8f0019]/30 focus:ring"
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Stock"
                  value={form.stock}
                  onChange={(event) => handleChange('stock', event.target.value)}
                  className="rounded-lg border border-[#ddc9b5] px-3 py-2 outline-none ring-[#8f0019]/30 focus:ring"
                />
                <label className="flex items-center gap-2 rounded-lg border border-[#ddc9b5] px-3 py-2 text-sm text-[#5f1f17]">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(event) => handleChange('isFeatured', event.target.checked)}
                  />
                  Featured product
                </label>
                <label className="flex items-center gap-2 rounded-lg border border-[#ddc9b5] px-3 py-2 text-sm text-[#5f1f17]">
                  <input
                    type="checkbox"
                    checked={form.isTrendingNow}
                    onChange={(event) => handleChange('isTrendingNow', event.target.checked)}
                  />
                  Trending Now
                </label>
                <label className="flex items-center gap-2 rounded-lg border border-[#ddc9b5] px-3 py-2 text-sm text-[#5f1f17]">
                  <input
                    type="checkbox"
                    checked={form.isNewArrival}
                    onChange={(event) => handleChange('isNewArrival', event.target.checked)}
                  />
                  New Arrivals
                </label>
              </div>

              <textarea
                placeholder="Product details"
                value={form.details}
                onChange={(event) => handleChange('details', event.target.value)}
                className="mt-3 min-h-20 w-full rounded-lg border border-[#ddc9b5] px-3 py-2 outline-none ring-[#8f0019]/30 focus:ring"
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(event) => handleChange('description', event.target.value)}
                className="mt-3 min-h-24 w-full rounded-lg border border-[#ddc9b5] px-3 py-2 outline-none ring-[#8f0019]/30 focus:ring"
              />
              <textarea
                placeholder="Style tip"
                value={form.styleTip}
                onChange={(event) => handleChange('styleTip', event.target.value)}
                className="mt-3 min-h-20 w-full rounded-lg border border-[#ddc9b5] px-3 py-2 outline-none ring-[#8f0019]/30 focus:ring"
              />
              <textarea
                placeholder="Image URLs (comma or new line separated)"
                value={form.imageUrls}
                onChange={(event) => handleChange('imageUrls', event.target.value)}
                className="mt-3 min-h-24 w-full rounded-lg border border-[#ddc9b5] px-3 py-2 outline-none ring-[#8f0019]/30 focus:ring"
              />

              {status && <p className="mt-3 text-sm text-[#7a5b4f]">{status}</p>}

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-[#8f0019] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6f0013]"
                >
                  Add Product
                </button>
              </div>
              </div>
            </form>
          )}

          {activeSection === 'all' && (
            <section className={`${ADMIN_PANEL_CARD} lg:overflow-hidden`}>
              <div className="shrink-0">
                <h2 className="font-serif text-2xl text-[#6f1c15]">All Products</h2>
                <p className="mt-1 text-sm text-[#7a5b4f]">Click a row to view full product details.</p>
              </div>
              {loading ? (
                <p className="mt-3 shrink-0 text-sm text-[#7a5b4f]">Loading products...</p>
              ) : products.length === 0 ? (
                <p className="mt-3 shrink-0 text-sm text-[#7a5b4f]">No products yet.</p>
              ) : (
                <div className={ADMIN_TABLE_WRAP}>
                  <div className="scrollbar-hide min-h-0 flex-1 overflow-x-auto overflow-y-auto overscroll-contain">
                  <table className="w-full min-w-[800px] table-fixed border-collapse text-left text-sm">
                    <colgroup>
                      <col className="w-[88px]" />
                      <col />
                      <col className="w-[140px]" />
                      <col className="w-[88px]" />
                      <col className="w-[140px]" />
                    </colgroup>
                    <thead>
                      <tr className="border-b border-[#eadbcb] bg-[#fdf7ef] text-xs font-semibold uppercase tracking-wide text-[#6e4f43]">
                        <th className="sticky top-0 z-10 border-b border-[#eadbcb] bg-[#fdf7ef] px-3 py-3 font-semibold shadow-sm">
                          Image
                        </th>
                        <th className="sticky top-0 z-10 border-b border-[#eadbcb] bg-[#fdf7ef] px-3 py-3 font-semibold shadow-sm">
                          Product name
                        </th>
                        <th className="sticky top-0 z-10 border-b border-[#eadbcb] bg-[#fdf7ef] px-3 py-3 font-semibold shadow-sm">
                          Price
                        </th>
                        <th className="sticky top-0 z-10 border-b border-[#eadbcb] bg-[#fdf7ef] px-3 py-3 font-semibold shadow-sm">
                          Stock
                        </th>
                        <th className="sticky top-0 z-10 border-b border-[#eadbcb] bg-[#fdf7ef] px-3 py-3 font-semibold shadow-sm">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => {
                        const thumb =
                          product.productImages?.[0] || 'https://via.placeholder.com/120x120?text=No+image'
                        const mrp = product.price?.mrp
                        const discounted = product.price?.discountedPrice
                        const hasDiscount =
                          mrp != null &&
                          discounted != null &&
                          Number(mrp) !== Number(discounted)
                        return (
                          <tr
                            key={product._id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setDetailProduct(product)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault()
                                setDetailProduct(product)
                              }
                            }}
                            className="cursor-pointer border-b border-[#f0e6da] transition hover:bg-[#fffaf6] focus:bg-[#fffaf6] focus:outline-none"
                          >
                            <td className="px-3 py-2 align-middle">
                              <img
                                src={thumb}
                                alt={product.productName || 'Product'}
                                className="h-16 w-16 rounded-lg border border-[#eadbcb] bg-[#fdf7ef] object-cover"
                              />
                            </td>
                            <td className="min-w-0 max-w-md break-words px-3 py-3 align-middle">
                              <p className="font-serif text-base font-semibold leading-snug text-[#5f1f17]">
                                {product.productName}
                              </p>
                              {(product.isFeatured || product.isTrendingNow || product.isNewArrival) && (
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {product.isFeatured && (
                                    <span className="rounded bg-[#f2e1d6] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[#5f1f17]">
                                      Featured
                                    </span>
                                  )}
                                  {product.isTrendingNow && (
                                    <span className="rounded bg-[#e8f0ff] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[#1e3a5f]">
                                      Trending
                                    </span>
                                  )}
                                  {product.isNewArrival && (
                                    <span className="rounded bg-[#e8f8ef] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[#1a5f2e]">
                                      New
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-3 align-middle">
                              <div className="space-y-1 text-[#5f1f17]">
                                <p>
                                  <span className="text-[10px] font-semibold uppercase tracking-wide text-[#8f0019]">
                                    {hasDiscount ? 'Discounted' : 'Price'}
                                  </span>
                                  <br />
                                  <span className="font-semibold">
                                    Rs. {discounted ?? mrp ?? 0}
                                  </span>
                                </p>
                                {hasDiscount && (
                                  <p>
                                    <span className="text-[10px] font-semibold uppercase tracking-wide text-[#6e4f43]">
                                      MRP
                                    </span>
                                    <br />
                                    <span className="text-sm text-[#6e4f43] line-through">Rs. {mrp}</span>
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-3 align-middle font-semibold text-[#5f1f17]">
                              {product.stock ?? 0}
                            </td>
                            <td className="px-3 py-3 align-middle">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={(event) => handleEdit(product, event)}
                                  className="rounded-md bg-[#f2e1d6] px-3 py-1.5 text-xs font-semibold text-[#5f1f17]"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={(event) => handleDelete(product._id, event)}
                                  className="rounded-md bg-[#ffe0e0] px-3 py-1.5 text-xs font-semibold text-[#8f0019]"
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
              )}
            </section>
          )}
        </div>
      </section>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-[90] bg-black/45 p-3 md:p-6" onClick={resetForm}>
          <div
            className="mx-auto flex h-full w-full max-w-4xl flex-col rounded-2xl bg-[#fffaf6] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#eadbcb] px-4 py-3 md:px-6">
              <h3 className="font-serif text-2xl text-[#6f1c15]">Edit Selected Product</h3>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-[#ddc9b5] px-3 py-1.5 text-sm font-semibold text-[#5f1f17]"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="scrollbar-hide flex-1 overflow-y-auto px-4 py-4 md:px-6">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#5f1f17]">
                    Product Name *
                  </span>
                  <input
                    value={form.productName}
                    onChange={(event) => handleChange('productName', event.target.value)}
                    className="w-full rounded-lg border border-[#ddc9b5] px-3 py-2 outline-none ring-[#8f0019]/30 focus:ring"
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#5f1f17]">
                    Brand
                  </span>
                  <input
                    value={form.brand}
                    onChange={(event) => handleChange('brand', event.target.value)}
                    className="w-full rounded-lg border border-[#ddc9b5] px-3 py-2 outline-none ring-[#8f0019]/30 focus:ring"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#5f1f17]">
                    Category
                  </span>
                  <select
                    value={form.category}
                    onChange={(event) => handleChange('category', event.target.value)}
                    className="w-full rounded-lg border border-[#ddc9b5] px-3 py-2 outline-none ring-[#8f0019]/30 focus:ring"
                  >
                    {categoryOptions.map((item) => (
                      <option key={item.category} value={item.category}>
                        {item.category}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#5f1f17]">
                    Sub Category
                  </span>
                  <select
                    value={form.subCategory}
                    onChange={(event) => handleChange('subCategory', event.target.value)}
                    className="w-full rounded-lg border border-[#ddc9b5] px-3 py-2 outline-none ring-[#8f0019]/30 focus:ring"
                  >
                    {subCategoryOptions.map((subCategory) => (
                      <option key={subCategory} value={subCategory}>
                        {subCategory}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#5f1f17]">
                    Fabric
                  </span>
                  <input
                    value={form.fabric}
                    onChange={(event) => handleChange('fabric', event.target.value)}
                    className="w-full rounded-lg border border-[#ddc9b5] px-3 py-2 outline-none ring-[#8f0019]/30 focus:ring"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#5f1f17]">
                    Occasion
                  </span>
                  <input
                    value={form.occasion}
                    onChange={(event) => handleChange('occasion', event.target.value)}
                    className="w-full rounded-lg border border-[#ddc9b5] px-3 py-2 outline-none ring-[#8f0019]/30 focus:ring"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#5f1f17]">
                    MRP
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={form.mrp}
                    onChange={(event) => handleChange('mrp', event.target.value)}
                    className="w-full rounded-lg border border-[#ddc9b5] px-3 py-2 outline-none ring-[#8f0019]/30 focus:ring"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#5f1f17]">
                    Discount Percent
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.discountPercent}
                    onChange={(event) => handleChange('discountPercent', event.target.value)}
                    className="w-full rounded-lg border border-[#ddc9b5] px-3 py-2 outline-none ring-[#8f0019]/30 focus:ring"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#5f1f17]">
                    Stock
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(event) => handleChange('stock', event.target.value)}
                    className="w-full rounded-lg border border-[#ddc9b5] px-3 py-2 outline-none ring-[#8f0019]/30 focus:ring"
                  />
                </label>
                <label className="flex items-center gap-2 rounded-lg border border-[#ddc9b5] px-3 py-2 text-sm text-[#5f1f17]">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(event) => handleChange('isFeatured', event.target.checked)}
                  />
                  Featured product
                </label>
                <label className="flex items-center gap-2 rounded-lg border border-[#ddc9b5] px-3 py-2 text-sm text-[#5f1f17]">
                  <input
                    type="checkbox"
                    checked={form.isTrendingNow}
                    onChange={(event) => handleChange('isTrendingNow', event.target.checked)}
                  />
                  Trending Now
                </label>
                <label className="flex items-center gap-2 rounded-lg border border-[#ddc9b5] px-3 py-2 text-sm text-[#5f1f17]">
                  <input
                    type="checkbox"
                    checked={form.isNewArrival}
                    onChange={(event) => handleChange('isNewArrival', event.target.checked)}
                  />
                  New Arrivals
                </label>
              </div>

              <textarea
                placeholder="Product details"
                value={form.details}
                onChange={(event) => handleChange('details', event.target.value)}
                className="mt-3 min-h-20 w-full rounded-lg border border-[#ddc9b5] px-3 py-2 outline-none ring-[#8f0019]/30 focus:ring"
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(event) => handleChange('description', event.target.value)}
                className="mt-3 min-h-24 w-full rounded-lg border border-[#ddc9b5] px-3 py-2 outline-none ring-[#8f0019]/30 focus:ring"
              />
              <textarea
                placeholder="Style tip"
                value={form.styleTip}
                onChange={(event) => handleChange('styleTip', event.target.value)}
                className="mt-3 min-h-20 w-full rounded-lg border border-[#ddc9b5] px-3 py-2 outline-none ring-[#8f0019]/30 focus:ring"
              />
              <textarea
                placeholder="Image URLs (comma or new line separated)"
                value={form.imageUrls}
                onChange={(event) => handleChange('imageUrls', event.target.value)}
                className="mt-3 min-h-24 w-full rounded-lg border border-[#ddc9b5] px-3 py-2 outline-none ring-[#8f0019]/30 focus:ring"
              />

              {status && <p className="mt-3 text-sm text-[#7a5b4f]">{status}</p>}

              <div className="mt-4 flex flex-wrap gap-2 pb-2">
                <button
                  type="submit"
                  className="rounded-lg bg-[#8f0019] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6f0013]"
                >
                  Update Product
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-[#8f0019] px-4 py-2 text-sm font-semibold text-[#8f0019]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailProduct && (
        <div
          className="fixed inset-0 z-[88] flex items-center justify-center bg-black/45 p-3 md:p-6"
          onClick={() => setDetailProduct(null)}
        >
          <div
            className="flex max-h-[min(90vh,900px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-[#fffaf6] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#eadbcb] px-4 py-3 md:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#8f0019]">
                  {detailProduct.category} — {detailProduct.subCategory}
                </p>
                <h3 className="mt-1 font-serif text-2xl text-[#6f1c15]">{detailProduct.productName}</h3>
                {detailProduct.brand && (
                  <p className="mt-1 text-sm text-[#6e4f43]">{detailProduct.brand}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setDetailProduct(null)}
                className="shrink-0 rounded-lg border border-[#ddc9b5] px-3 py-1.5 text-sm font-semibold text-[#5f1f17]"
              >
                Close
              </button>
            </div>

            <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-6">
              {detailProduct.productImages?.length > 0 && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {detailProduct.productImages.map((url, index) => (
                    <img
                      key={`${url}-${index}`}
                      src={url}
                      alt={`${detailProduct.productName} ${index + 1}`}
                      className="aspect-square w-full rounded-lg border border-[#eadbcb] bg-[#fdf7ef] object-cover"
                    />
                  ))}
                </div>
              )}

              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-[#eadbcb] bg-white p-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[#8f0019]">Selling price</dt>
                  <dd className="mt-1 text-lg font-semibold text-[#5f1f17]">
                    Rs. {detailProduct.price?.discountedPrice ?? detailProduct.price?.mrp ?? 0}
                  </dd>
                </div>
                <div className="rounded-lg border border-[#eadbcb] bg-white p-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[#8f0019]">MRP & discount</dt>
                  <dd className="mt-1 text-sm text-[#5f1f17]">
                    MRP: Rs. {detailProduct.price?.mrp ?? '—'}
                    {detailProduct.price?.discountPercent != null && (
                      <span className="ml-2 text-[#6e4f43]">
                        ({detailProduct.price.discountPercent}% off)
                      </span>
                    )}
                  </dd>
                </div>
                <div className="rounded-lg border border-[#eadbcb] bg-white p-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[#8f0019]">Stock</dt>
                  <dd className="mt-1 font-semibold text-[#5f1f17]">{detailProduct.stock ?? 0}</dd>
                </div>
                <div className="rounded-lg border border-[#eadbcb] bg-white p-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[#8f0019]">Flags</dt>
                  <dd className="mt-1 flex flex-wrap gap-1 text-sm text-[#5f1f17]">
                    {detailProduct.isFeatured && <span>Featured</span>}
                    {detailProduct.isTrendingNow && <span>Trending</span>}
                    {detailProduct.isNewArrival && <span>New arrival</span>}
                    {!detailProduct.isFeatured &&
                      !detailProduct.isTrendingNow &&
                      !detailProduct.isNewArrival && <span className="text-[#6e4f43]">None</span>}
                  </dd>
                </div>
              </dl>

              {[
                ['Type', detailProduct.type],
                ['Color', detailProduct.color],
                ['Pattern', detailProduct.pattern],
                ['Fabric', detailProduct.fabric],
                ['Fit', detailProduct.fit],
                ['Occasion', detailProduct.occasion],
                ['Length', detailProduct.length],
                ['Kurta length', detailProduct.kurtaLength],
                ['Saree length', detailProduct.sareeLength],
                ['Sleeves', detailProduct.sleeves],
                ['Neck', detailProduct.neck],
                ['Closure', detailProduct.closure],
                ['Back design', detailProduct.backDesign],
                ['Bottom', detailProduct.bottom],
                ['Dupatta', detailProduct.dupatta],
                ['Blouse piece', detailProduct.blousePiece],
                ['Texture', detailProduct.texture],
                ['Finish', detailProduct.finish],
              ]
                .filter(([, value]) => value)
                .map(([label, value]) => (
                  <div key={label} className="mt-3 border-b border-[#f0e6da] pb-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#8f0019]">{label}</p>
                    <p className="mt-1 text-sm text-[#5f1f17]">{value}</p>
                  </div>
                ))}

              {detailProduct.availableColors?.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#8f0019]">Available colors</p>
                  <p className="mt-1 text-sm text-[#5f1f17]">{detailProduct.availableColors.join(', ')}</p>
                </div>
              )}

              {detailProduct.design_details &&
                Object.keys(detailProduct.design_details).some(
                  (key) => detailProduct.design_details[key]?.length > 0
                ) && (
                  <div className="mt-4 rounded-lg border border-[#eadbcb] bg-white p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#8f0019]">
                      Design details
                    </p>
                    <ul className="mt-2 space-y-2 text-sm text-[#5f1f17]">
                      {Object.entries(detailProduct.design_details).map(([key, values]) =>
                        Array.isArray(values) && values.length > 0 ? (
                          <li key={key}>
                            <span className="font-semibold capitalize">
                              {key.replace(/_/g, ' ')}:{' '}
                            </span>
                            {values.join(', ')}
                          </li>
                        ) : null
                      )}
                    </ul>
                  </div>
                )}

              {detailProduct.details && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#8f0019]">Details</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-[#5f1f17]">{detailProduct.details}</p>
                </div>
              )}
              {detailProduct.description && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#8f0019]">Description</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-[#5f1f17]">{detailProduct.description}</p>
                </div>
              )}
              {detailProduct.styleTip && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#8f0019]">Style tip</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-[#5f1f17]">{detailProduct.styleTip}</p>
                </div>
              )}

              <div className="mt-6 border-t border-[#eadbcb] pt-3 text-xs text-[#7a5b4f]">
                <p>Product ID: {detailProduct._id}</p>
                {detailProduct.createdAt && (
                  <p className="mt-1">Created: {new Date(detailProduct.createdAt).toLocaleString()}</p>
                )}
                {detailProduct.updatedAt && (
                  <p className="mt-1">Updated: {new Date(detailProduct.updatedAt).toLocaleString()}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default AdminPanelPage
