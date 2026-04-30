import Footer from '../components/Footer'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function ProductsPage() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()
  const selectedCategory = searchParams.get('category') || ''
  const selectedSubCategory = searchParams.get('subCategory') || ''
  const pageHeading = selectedSubCategory
    ? `${selectedCategory} - ${selectedSubCategory}`
    : selectedCategory || 'All Categories'

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const query = new URLSearchParams()
        if (selectedCategory) {
          query.set('category', selectedCategory)
        }
        if (selectedSubCategory) {
          query.set('subCategory', selectedSubCategory)
        }

        const response = await fetch(
          `${API_BASE_URL}/api/products${query.toString() ? `?${query.toString()}` : ''}`,
        )
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        const data = await response.json()
        setProducts(data)
      } catch (fetchError) {
        setError(fetchError.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [selectedCategory, selectedSubCategory])

  return (
    <>
      <main className="bg-[#faf7ec] pt-10">
        <section className="mx-auto w-full max-w-6xl px-4 pb-12 md:px-6">
          <h1 className="font-serif text-3xl text-[#5f1f17] md:text-4xl">
            {pageHeading}
          </h1>
          {(selectedCategory || selectedSubCategory) && (
            <p className="mt-2 text-sm text-[#7a5b4f]">
              Showing: {selectedCategory || 'All Categories'}
              {selectedSubCategory ? ` / ${selectedSubCategory}` : ''}
            </p>
          )}

          {isLoading && <p className="mt-8 text-sm text-[#7a5b4f]">Loading products...</p>}
          {error && <p className="mt-8 text-sm text-[#b42318]">{error}</p>}

          {!isLoading && !error && products.length === 0 && (
            <div className="mt-6 rounded-2xl border border-[#eadbcb] bg-white p-8 text-center">
              <h2 className="font-serif text-2xl text-[#6f1c15]">No products found</h2>
              <p className="mt-2 text-sm text-[#7a5b4f]">
                No products available for this category/subcategory right now.
              </p>
              <Link
                to="/products"
                className="mt-5 inline-flex rounded-full border border-[#8f0019] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#8f0019] transition hover:bg-[#8f0019] hover:text-white"
              >
                View all products
              </Link>
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {products.map((product) => (
              <article
                key={product._id}
                className="mx-auto w-full max-w-[260px] overflow-hidden rounded-xl border border-[#eadbcb] bg-white shadow-sm"
              >
                <Link to={`/products/${product._id}`}>
                  <img
                    src={product.productImages?.[0] || 'https://via.placeholder.com/400x500?text=Product'}
                    alt={product.productName}
                    className="aspect-square w-full object-contain bg-[#fdf7ef] p-2"
                  />
                </Link>
                <div className="p-3">
                  <p className="hidden text-xs font-semibold uppercase tracking-wider text-[#8f0019] sm:block">
                    {product.category} - {product.subCategory}
                  </p>
                  <Link to={`/products/${product._id}`}>
                    <h2 className="mt-1 line-clamp-2 font-serif text-lg text-[#6f1c15] transition hover:text-[#8f0019]">
                      {product.productName}
                    </h2>
                  </Link>
                  <p className="mt-1 text-xs text-[#7a5b4f]">
                    Fabric: {product.fabric || '-'}
                  </p>
                  <p className="mt-2 flex items-center gap-2">
                    <span className="text-base font-bold text-[#1f8a3b]">
                      Rs. {product.price?.discountedPrice ?? product.price?.mrp ?? '-'}
                    </span>
                    <span className="text-xs text-[#c62828] line-through">
                      Rs. {product.price?.mrp ?? '-'}
                    </span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default ProductsPage
