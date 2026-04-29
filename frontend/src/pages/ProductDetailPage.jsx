import Footer from '../components/Footer'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/products/${id}`)
        if (!response.ok) {
          throw new Error('Product not found')
        }
        const data = await response.json()
        setProduct(data)
      } catch (fetchError) {
        setError(fetchError.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  if (isLoading) {
    return (
      <>
        <main className="bg-[#faf7ec] pt-28">
          <section className="mx-auto w-full max-w-7xl px-4 pb-16 md:px-8">
            <p className="text-sm text-[#6e4f43]">Loading product...</p>
          </section>
        </main>
        <Footer />
      </>
    )
  }

  if (!product || error) {
    return (
      <>
        <main className="bg-[#faf7ec] pt-28">
          <section className="mx-auto w-full max-w-7xl px-4 pb-16 md:px-8">
            <p className="text-sm text-[#6e4f43]">Product not found.</p>
            <Link
              to="/products"
              className="mt-4 inline-flex rounded-full border border-[#8f0019] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#8f0019] transition hover:bg-[#8f0019] hover:text-white"
            >
              Back to Products
            </Link>
          </section>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <main className="bg-[#faf7ec] pt-28">
        <section className="mx-auto w-full max-w-7xl px-4 pb-16 md:px-8">
          <Link to="/products" className="text-sm font-medium text-[#8f0019]">
            ← Back to Products
          </Link>

          <div className="mt-6 grid gap-8 lg:grid-cols-2">
            <article className="overflow-hidden rounded-2xl border border-[#eadbcb] bg-white shadow-sm">
              <img
                src={product.images?.[0]?.url || 'https://via.placeholder.com/800x1000?text=Product'}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </article>

            <article className="rounded-2xl border border-[#eadbcb] bg-white p-6 shadow-sm md:p-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#8f0019]">
                {product.category} - {product.subCategory}
              </p>
              <h1 className="mt-3 font-serif text-3xl text-[#6f1c15] md:text-4xl">
                {product.name}
              </h1>
              <p className="mt-3 text-sm text-[#7a5b4f]">{product.shortDescription}</p>

              <p className="mt-6 flex items-center gap-3">
                <span className="text-2xl font-bold text-[#7f2018]">
                  Rs. {product.discountPrice}
                </span>
                <span className="text-base text-[#8f837a] line-through">
                  Rs. {product.price}
                </span>
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-[#6e4f43]">
                <p>
                  <span className="font-semibold text-[#5f1f17]">Fabric:</span>{' '}
                  {product.attributes?.fabric || '-'}
                </p>
                <p>
                  <span className="font-semibold text-[#5f1f17]">Fit:</span>{' '}
                  {product.attributes?.fit || '-'}
                </p>
                <p>
                  <span className="font-semibold text-[#5f1f17]">Occasion:</span>{' '}
                  {product.attributes?.occasion || '-'}
                </p>
                <p>
                  <span className="font-semibold text-[#5f1f17]">Sleeves:</span>{' '}
                  {product.attributes?.sleeves || '-'}
                </p>
              </div>

              <p className="mt-6 text-sm leading-7 text-[#6e4f43]">{product.description}</p>

              <h2 className="mt-8 font-serif text-2xl text-[#6f1c15]">Highlights</h2>
              <ul className="mt-3 space-y-2 text-sm text-[#6e4f43]">
                {(product.features || []).map((feature) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>

              <h2 className="mt-8 font-serif text-2xl text-[#6f1c15]">Style Tip</h2>
              <p className="mt-3 text-sm leading-7 text-[#6e4f43]">{product.styleTip}</p>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default ProductDetailPage
