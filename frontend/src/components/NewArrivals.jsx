import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function NewArrivals() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products`)
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        const data = await response.json()
        setProducts(Array.isArray(data) ? data : [])
      } catch (fetchError) {
        setError(fetchError.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const newArrivalProducts = useMemo(() => {
    const flaggedProducts = products.filter((product) => product.isNewArrival)
    const sortedByDate = [...flaggedProducts].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    )

    if (sortedByDate.length > 0) return sortedByDate
    return products
  }, [products])

  const itemsPerSlide = 4
  const totalSlides = Math.ceil(newArrivalProducts.length / itemsPerSlide)
  const visibleProducts = newArrivalProducts.slice(
    activeIndex * itemsPerSlide,
    activeIndex * itemsPerSlide + itemsPerSlide
  )

  const goPrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? Math.max(totalSlides - 1, 0) : prev - 1))
  }

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1 >= totalSlides ? 0 : prev + 1))
  }

  return (
    <article
      className="relative overflow-hidden bg-cover bg-center py-6 text-[#f7e9dc] md:py-8"
      style={{
        backgroundImage:
          "url('https://res.cloudinary.com/dkq4kvwrr/image/upload/q_auto/f_auto/v1777542474/ChatGPT_Image_Apr_30_2026_03_15_33_PM_pxxynj.png')",
      }}
    >
      <div className="relative px-3 pb-6 md:px-6 md:pb-8">
        <h2 className="mt-3 text-center font-serif text-xl uppercase tracking-wider text-[#f2d9c5] md:mt-4 md:text-4xl">
          New Arrivals
        </h2>

        {isLoading && <p className="mt-6 text-center text-sm text-[#f1d6c2]">Loading products...</p>}
        {error && <p className="mt-6 text-center text-sm text-[#ffd4d4]">{error}</p>}

        {!isLoading && !error && (
          <div className="relative">
            {totalSlides > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrevious}
                  className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#d7b09a] bg-[#8a0023]/70 text-[#f4d8c5] transition hover:bg-[#a30a34]"
                  aria-label="Previous products"
                >
                  &#8249;
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#d7b09a] bg-[#8a0023]/70 text-[#f4d8c5] transition hover:bg-[#a30a34]"
                  aria-label="Next products"
                >
                  &#8250;
                </button>
              </>
            )}

            <div className="mt-4 grid gap-3 pl-10 sm:grid-cols-2 md:pl-12 lg:grid-cols-4">
              {visibleProducts.map((product) => (
                <Link
                  key={product._id}
                  to={`/products/${product._id}`}
                  className="group mx-auto w-full max-w-[250px] overflow-hidden rounded-lg bg-[#8a0023]/90 p-2"
                >
                  <img
                    src={product.productImages?.[0] || 'https://via.placeholder.com/400x500?text=Product'}
                    alt={product.productName}
                    className="h-60 w-full rounded-md object-cover md:h-[350px]"
                    loading="lazy"
                  />
                  <p className="mt-2 line-clamp-1 text-sm text-[#f8dfcd]">{product.productName}</p>
                  <p className="text-sm font-semibold text-white">
                    Rs. {product.price?.discountedPrice ?? product.price?.mrp ?? '-'}
                  </p>
                </Link>
              ))}
            </div>

            {newArrivalProducts.length === 0 && (
              <p className="mt-6 text-center text-sm text-[#f1d6c2]">
                New arrival products will be updated soon.
              </p>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

export default NewArrivals
