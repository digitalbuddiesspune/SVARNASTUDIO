import { Link } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function NewArrivals() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [isMobileView, setIsMobileView] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const transitionTimeoutRef = useRef(null)

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

  useEffect(() => {
    const mobileMediaQuery = window.matchMedia('(max-width: 767px)')

    const handleViewportChange = () => {
      setIsMobileView(mobileMediaQuery.matches)
    }

    handleViewportChange()
    mobileMediaQuery.addEventListener('change', handleViewportChange)

    return () => {
      mobileMediaQuery.removeEventListener('change', handleViewportChange)
    }
  }, [])

  const newArrivalProducts = useMemo(() => {
    const flaggedProducts = products.filter((product) => product.isNewArrival)
    const sortedByDate = [...flaggedProducts].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    )

    if (sortedByDate.length > 0) return sortedByDate
    return products
  }, [products])

  const itemsPerSlide = isMobileView ? 2 : 4
  const totalSlides = Math.ceil(newArrivalProducts.length / itemsPerSlide)
  const visibleProducts = newArrivalProducts.slice(
    activeIndex * itemsPerSlide,
    activeIndex * itemsPerSlide + itemsPerSlide
  )

  useEffect(() => {
    if (activeIndex >= totalSlides) {
      setActiveIndex(0)
    }
  }, [activeIndex, totalSlides])

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current)
      }
    }
  }, [])

  const switchSlide = (nextIndex) => {
    if (isTransitioning || totalSlides <= 1) return

    setIsTransitioning(true)
    transitionTimeoutRef.current = setTimeout(() => {
      setActiveIndex(nextIndex)
      setIsTransitioning(false)
    }, 180)
  }

  const goPrevious = () => {
    const nextIndex = activeIndex === 0 ? Math.max(totalSlides - 1, 0) : activeIndex - 1
    switchSlide(nextIndex)
  }

  const goNext = () => {
    const nextIndex = activeIndex + 1 >= totalSlides ? 0 : activeIndex + 1
    switchSlide(nextIndex)
  }

  return (
    <article
      className="relative overflow-hidden bg-no-repeat py-6 text-[#f7e9dc] md:py-8"
      style={{
        backgroundImage:
          "url('https://res.cloudinary.com/dkq4kvwrr/image/upload/q_auto/f_auto/v1777542474/ChatGPT_Image_Apr_30_2026_03_15_33_PM_pxxynj.png')",
        backgroundPosition: 'top center',
        backgroundSize: '100% 100%',
      }}
    >
      <div className="relative px-4 pb-7 md:px-8 md:pb-9">
        <div className="pt-5 text-center md:pt-7">
          <p className="text-[11px] font-semibold uppercase tracking-[2px] text-[#f2d9c5] md:text-xs">
            Just Landed
          </p>
          <h2 className="mt-1 font-serif text-3xl uppercase tracking-[1.5px] text-white md:text-5xl">
            New Arrivals
          </h2>
          <div className="mx-auto mt-2 flex w-fit items-center gap-3 text-[#f2d9c5]">
            <span className="h-px w-14 bg-[#f2d9c5]/70 md:w-20" />
            <span className="text-sm leading-none">❦</span>
            <span className="h-px w-14 bg-[#f2d9c5]/70 md:w-20" />
          </div>
        </div>

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

            <div
              className={`mt-4 grid grid-cols-2 gap-3 px-8 transition-opacity duration-300 md:px-10 lg:grid-cols-4 ${
                isTransitioning ? 'opacity-0' : 'opacity-100'
              }`}
            >
              {visibleProducts.map((product) => (
                <Link
                  key={product._id}
                  to={`/products/${product._id}`}
                  className="group w-full overflow-hidden rounded-none bg-[#8a0023]/90 p-2 md:rounded-lg"
                >
                  <img
                    src={product.productImages?.[0] || 'https://via.placeholder.com/400x500?text=Product'}
                    alt={product.productName}
                    className="h-44 w-full rounded-none object-cover md:h-[350px] md:rounded-md"
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
