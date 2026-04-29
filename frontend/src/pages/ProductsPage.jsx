import Footer from '../components/Footer'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

function ProductsPage() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()
  const selectedCategory = searchParams.get('category') || ''
  const selectedSubCategory = searchParams.get('subCategory') || ''

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
          `http://localhost:5000/api/products${query.toString() ? `?${query.toString()}` : ''}`,
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
      <main className="bg-[#faf7ec] pt-28">
        <section className="mx-auto w-full max-w-7xl px-4 pb-16 md:px-8">
          <h1 className="font-serif text-4xl text-[#5f1f17] md:text-5xl">
            Our Products
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-[#6e4f43] md:text-base">
            Explore signature pieces crafted with detail, comfort, and timeless
            elegance.
          </p>
          {(selectedCategory || selectedSubCategory) && (
            <p className="mt-3 text-sm text-[#7a5b4f]">
              Showing: {selectedCategory || 'All Categories'}
              {selectedSubCategory ? ` / ${selectedSubCategory}` : ''}
            </p>
          )}

          {isLoading && <p className="mt-8 text-sm text-[#7a5b4f]">Loading products...</p>}
          {error && <p className="mt-8 text-sm text-[#b42318]">{error}</p>}

          {!isLoading && !error && products.length === 0 && (
            <div className="mt-8 rounded-2xl border border-[#eadbcb] bg-white p-8 text-center">
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

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <article
                key={product._id}
                className="overflow-hidden rounded-2xl border border-[#eadbcb] bg-white shadow-sm"
              >
                <Link to={`/products/${product._id}`}>
                  <img
                    src={product.images?.[0]?.url || 'https://via.placeholder.com/400x500?text=Product'}
                    alt={product.name}
                    className="h-72 w-full object-cover"
                  />
                </Link>
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#8f0019]">
                    {product.category} - {product.subCategory}
                  </p>
                  <Link to={`/products/${product._id}`}>
                    <h2 className="mt-2 font-serif text-2xl text-[#6f1c15] transition hover:text-[#8f0019]">
                      {product.name}
                    </h2>
                  </Link>
                  <p className="mt-2 text-sm text-[#7a5b4f]">
                    Fabric: {product.attributes?.fabric || '-'}
                  </p>
                  <p className="mt-4 flex items-center gap-3">
                    <span className="text-xl font-bold text-[#7f2018]">
                      Rs. {product.discountPrice}
                    </span>
                    <span className="text-sm text-[#8f837a] line-through">
                      Rs. {product.price}
                    </span>
                  </p>
                  <Link
                    to={`/products/${product._id}`}
                    className="mt-4 inline-flex rounded-full border border-[#8f0019] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#8f0019] transition hover:bg-[#8f0019] hover:text-white"
                  >
                    View Details
                  </Link>
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
