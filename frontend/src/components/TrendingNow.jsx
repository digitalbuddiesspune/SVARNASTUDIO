import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function TrendingNow() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

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

  const trendingProducts = useMemo(() => {
    const flaggedProducts = products
      .filter((product) => product.isTrendingNow)
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))

    if (flaggedProducts.length > 0) {
      return flaggedProducts.slice(0, 4)
    }

    return [...products].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 4)
  }, [products])

  return (
    <article className="relative overflow-hidden bg-[#f6ecdf] px-4 pb-4 pt-5 text-[#5f1f17] md:px-8 md:pb-5 md:pt-6">

      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center gap-3 md:items-center">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[2px] text-[#8f1328]">Editor Picks</p>
          <h2 className="mt-1 font-serif text-3xl uppercase tracking-wide text-[#6f1b1d] md:text-5xl">
            Trending Now
          </h2>
          <div className="mt-2 flex w-fit items-center gap-3 text-[#8f1328] mx-auto">
            <span className="h-px w-14 bg-[#8f1328]/70 md:w-20" />
            <span className="text-sm leading-none">❦</span>
            <span className="h-px w-14 bg-[#8f1328]/70 md:w-20" />
          </div>
        </div>
        <Link
          to="/products"
          className="rounded-full border border-[#8f0019] bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#8f0019] transition hover:bg-[#8f0019] hover:text-white md:absolute md:right-0 md:top-1/2 md:-translate-y-1/2"
        >
          View All
        </Link>
      </div>

      {isLoading && (
        <p className="relative mx-auto mt-6 w-full max-w-7xl text-sm text-[#6f4d42]">
          Loading trending products...
        </p>
      )}
      {error && (
        <p className="relative mx-auto mt-6 w-full max-w-7xl text-sm text-[#b42318]">{error}</p>
      )}

      {!isLoading && !error && (
        <div className="relative mx-auto mt-7 grid w-full max-w-7xl grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
          {trendingProducts.map((product) => (
            <article
              key={product._id}
              className="group overflow-hidden rounded-2xl border border-[#d7bda4] bg-transparent p-2 text-[#5f1f17] transition hover:bg-[#f5ebdf]"
            >
              <Link to={`/products/${product._id}`}>
                <div className="overflow-hidden rounded-xl">
                  <img
                    src={product.productImages?.[0] || 'https://via.placeholder.com/400x500?text=Product'}
                    alt={product.productName}
                    className="h-44 w-full bg-[#f8f5ef] object-cover transition duration-500 group-hover:scale-105 md:h-64"
                    loading="lazy"
                  />
                </div>
              </Link>
              <p className="mt-0 text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8f0019]">
                {product.category}
              </p>
              <Link to={`/products/${product._id}`}>
                <h3 className="mt-1 line-clamp-2 font-serif text-base text-[#6f1c15] transition group-hover:text-[#8f0019] md:text-lg">
                  {product.productName}
                </h3>
              </Link>
              <div className="mt-4 flex items-end justify-between gap-2">
                <p className="text-sm font-bold text-[#7f2018]">
                  Rs. {product.price?.discountedPrice ?? product.price?.mrp ?? '-'}
                </p>
                <span className="rounded-full bg-[#8f0019]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[1px] text-[#8f0019]">
                  Hot
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      {!isLoading && !error && trendingProducts.length === 0 && (
        <p className="relative mx-auto mt-6 w-full max-w-7xl text-sm text-[#6f4d42]">
          Trending products will appear here soon.
        </p>
      )}
    </article>
  )
}

export default TrendingNow
