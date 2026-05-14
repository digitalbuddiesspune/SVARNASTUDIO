import InvoiceGenerator from '../components/InvoiceGenerator'
import AllInvoicesList from '../components/AllInvoicesList'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
const ADMIN_STORAGE_KEY = 'svarna_admin_auth'

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

function AdminPanelPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(defaultForm)
  const [editingId, setEditingId] = useState('')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('dashboard')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    const isAuth = localStorage.getItem(ADMIN_STORAGE_KEY) === 'true'
    if (!isAuth) {
      navigate('/admin')
      return
    }
    fetchProducts()
  }, [navigate])

  useEffect(() => {
    if (!subCategoryOptions.includes(form.subCategory)) {
      setForm((prev) => ({
        ...prev,
        subCategory: subCategoryOptions[0] || '',
      }))
    }
  }, [form.subCategory, subCategoryOptions])

  useEffect(() => {
    document.body.style.overflow = isEditModalOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isEditModalOpen])

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

  const handleEdit = (product) => {
    setEditingId(product._id)
    setActiveSection('edit')
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

  const handleDelete = async (productId) => {
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
      setStatus('Product deleted successfully.')
      setActiveSection('delete')
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
  const lowStockProducts = products.filter((product) => Number(product.stock || 0) <= 2).length

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#faf7ec] px-4 py-8 md:px-6">
      <section className="mx-auto grid w-full max-w-7xl gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="print:hidden rounded-2xl border border-[#eadbcb] bg-white p-4 shadow-sm lg:sticky lg:top-6 lg:h-fit">
          <h1 className="font-serif text-2xl text-[#5f1f17]">Admin Panel</h1>
          <p className="mt-1 text-xs text-[#7a5b4f]">Manage products and catalog.</p>

          <nav className="mt-4 space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'add', label: 'Add Product' },
              { id: 'edit', label: 'Edit Product' },
              { id: 'delete', label: 'Delete Product' },
              { id: 'all', label: 'All Products' },
              { id: 'invoice', label: 'Invoice Generate' },
              { id: 'invoices-all', label: 'All Invoices' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                  activeSection === item.id
                    ? 'bg-[#8f0019] text-white'
                    : 'bg-[#f8efe7] text-[#5f1f17] hover:bg-[#f2dfd1]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-6 w-full rounded-lg border border-[#8f0019] px-4 py-2 text-sm font-semibold text-[#8f0019] transition hover:bg-[#8f0019] hover:text-white"
          >
            Logout
          </button>
        </aside>

        <div className="space-y-5 print:max-w-none">
          {activeSection === 'invoice' && <InvoiceGenerator />}

          {activeSection === 'invoices-all' && <AllInvoicesList />}

          {activeSection === 'dashboard' && (
            <section className="rounded-2xl border border-[#eadbcb] bg-white p-4 shadow-sm md:p-6">
              <h2 className="font-serif text-2xl text-[#6f1c15]">Dashboard</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <article className="rounded-xl bg-[#f9ece5] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#8f0019]">Total Products</p>
                  <p className="mt-2 text-3xl font-bold text-[#5f1f17]">{totalProducts}</p>
                </article>
                <article className="rounded-xl bg-[#f9ece5] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#8f0019]">Featured</p>
                  <p className="mt-2 text-3xl font-bold text-[#5f1f17]">{featuredProducts}</p>
                </article>
                <article className="rounded-xl bg-[#f9ece5] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#8f0019]">Categories</p>
                  <p className="mt-2 text-3xl font-bold text-[#5f1f17]">{totalCategories}</p>
                </article>
                <article className="rounded-xl bg-[#fff1ee] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#b42318]">Low Stock (&lt;=2)</p>
                  <p className="mt-2 text-3xl font-bold text-[#8f0019]">{lowStockProducts}</p>
                </article>
              </div>
            </section>
          )}

          {activeSection === 'add' && (
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-[#eadbcb] bg-white p-4 shadow-sm md:p-6"
            >
              <h2 className="font-serif text-2xl text-[#6f1c15]">
                Add Product
              </h2>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
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
            </form>
          )}

          {activeSection === 'edit' && (
            <section className="rounded-2xl border border-[#eadbcb] bg-white p-4 shadow-sm md:p-6">
              <h2 className="font-serif text-2xl text-[#6f1c15]">Edit Products</h2>
              <p className="mt-1 text-sm text-[#7a5b4f]">
                Click edit on any card to open the scrollable edit popup.
              </p>

              {loading ? (
                <p className="mt-3 text-sm text-[#7a5b4f]">Loading products...</p>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => (
                    <article
                      key={product._id}
                      className="overflow-hidden rounded-xl border border-[#eadbcb] bg-white shadow-sm"
                    >
                      <img
                        src={product.productImages?.[0] || 'https://via.placeholder.com/400x500?text=Product'}
                        alt={product.productName}
                        className="aspect-square w-full bg-[#fdf7ef] object-contain p-2"
                      />
                      <div className="p-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#8f0019]">
                          {product.category} - {product.subCategory}
                        </p>
                        <h3 className="mt-1 line-clamp-2 font-serif text-lg text-[#5f1f17]">
                          {product.productName}
                        </h3>
                        <p className="mt-1 text-sm text-[#6e4f43]">
                          Rs. {product.price?.discountedPrice ?? product.price?.mrp ?? 0}
                        </p>
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(product)}
                            className="rounded-md bg-[#f2e1d6] px-3 py-1.5 text-xs font-semibold text-[#5f1f17]"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(product._id)}
                            className="rounded-md bg-[#ffe0e0] px-3 py-1.5 text-xs font-semibold text-[#8f0019]"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}

            </section>
          )}

          {(activeSection === 'all' || activeSection === 'delete') && (
            <section className="rounded-2xl border border-[#eadbcb] bg-white p-4 shadow-sm md:p-6">
              <h2 className="font-serif text-2xl text-[#6f1c15]">All Products</h2>
              {loading ? (
                <p className="mt-3 text-sm text-[#7a5b4f]">Loading products...</p>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => (
                    <article
                      key={product._id}
                      className="rounded-xl border border-[#eadbcb] bg-white p-3 shadow-sm"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#8f0019]">
                        {product.category} - {product.subCategory}
                      </p>
                      <h3 className="mt-1 line-clamp-2 font-serif text-lg text-[#5f1f17]">
                        {product.productName}
                      </h3>
                      <p className="mt-1 text-sm text-[#6e4f43]">
                        Rs. {product.price?.discountedPrice ?? product.price?.mrp ?? 0}
                      </p>

                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(product)}
                          className="rounded-md bg-[#f2e1d6] px-3 py-1.5 text-xs font-semibold text-[#5f1f17]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(product._id)}
                          className="rounded-md bg-[#ffe0e0] px-3 py-1.5 text-xs font-semibold text-[#8f0019]"
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
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

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
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
    </main>
  )
}

export default AdminPanelPage
