import Footer from '../components/Footer'
import HowToOrder from '../components/HowToOrder'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [selectedImage, setSelectedImage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products/${id}`)
        if (!response.ok) {
          throw new Error('Product not found')
        }
        const data = await response.json()
        setProduct(data)
        setSelectedImage(
          data.productImages?.[0] || 'https://via.placeholder.com/800x1000?text=Product',
        )
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
        <main className="bg-[#faf7ec] pt-8 md:pt-10">
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
        <main className="bg-[#faf7ec] pt-8 md:pt-10">
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

  const designHighlights = Object.values(product.design_details || {})
    .flat()
    .filter((item) => typeof item === 'string' && item.trim().length > 0)

  const fallbackHighlights = [
    product.pattern,
    product.neck,
    product.sleeves,
    product.backDesign,
    product.details,
  ].filter((item) => typeof item === 'string' && item.trim().length > 0)

  const highlights =
    designHighlights.length > 0 ? designHighlights : fallbackHighlights

  const toTitle = (key) =>
    key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .trim()
      .replace(/^./, (char) => char.toUpperCase())

  const designDetailEntries = Object.entries(product.design_details || {})
    .map(([key, value]) => {
      const values = Array.isArray(value)
        ? value.filter((item) => typeof item === 'string' && item.trim().length > 0)
        : typeof value === 'string' && value.trim().length > 0
          ? [value]
          : []

      return { key, values }
    })
    .filter((entry) => entry.values.length > 0)

  const trouserDesignValues = Array.isArray(product.trouserDesign)
    ? product.trouserDesign.filter(
        (item) => typeof item === 'string' && item.trim().length > 0
      )
    : typeof product.trouserDesign === 'string' && product.trouserDesign.trim().length > 0
      ? [product.trouserDesign]
      : []

  if (trouserDesignValues.length > 0) {
    designDetailEntries.push({
      key: 'trouserDesign',
      values: trouserDesignValues,
    })
  }

  const galleryImages =
    product.productImages && product.productImages.length > 0
      ? product.productImages.filter((img) => typeof img === 'string' && img.trim().length > 0)
      : ['https://via.placeholder.com/800x1000?text=Product']

  const activeImage = selectedImage || galleryImages[0]
  const hasMultipleImages = galleryImages.length > 1

  return (
    <>
      <main className="bg-[#faf7ec] pt-6 md:pt-8">
        <section className="mx-auto w-full max-w-7xl px-4 pb-16 md:px-8">
          <Link to="/products" className="text-sm font-medium text-[#8f0019]">
            ← Back to Products
          </Link>

          <div
            className={`mt-4 grid items-start gap-4 lg:gap-6 ${
              hasMultipleImages
                ? 'lg:grid-cols-[72px_minmax(0,540px)_minmax(0,1fr)]'
                : 'lg:grid-cols-[minmax(0,540px)_minmax(0,1fr)]'
            }`}
          >
            {hasMultipleImages && (
              <aside className="hidden lg:sticky lg:top-24 lg:block">
                <div className="max-h-[540px] space-y-2 overflow-y-auto pr-1">
                  {galleryImages.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      className={`overflow-hidden rounded-lg border bg-white transition ${
                        activeImage === image
                          ? 'border-[#8f0019] ring-1 ring-[#8f0019]'
                          : 'border-[#d8ccc1] hover:border-[#8f0019]'
                      }`}
                      onClick={() => setSelectedImage(image)}
                    >
                      <img
                        src={image}
                        alt={`${product.productName} thumbnail ${index + 1}`}
                        className="h-16 w-[68px] object-cover"
                      />
                    </button>
                  ))}
                </div>
              </aside>
            )}

            <article className="overflow-hidden rounded-2xl bg-[#f3eee6] lg:sticky lg:top-24">
              <div className="p-3">
                <img
                  src={activeImage}
                  alt={product.productName}
                  className="aspect-square w-full rounded-xl bg-[#f8f5ef] object-contain"
                />
              </div>
              {hasMultipleImages && (
                <div className="mt-1 flex gap-2 overflow-x-auto px-3 pb-3 lg:hidden">
                  {galleryImages.map((image, index) => (
                    <button
                      key={`${image}-mobile-${index}`}
                      type="button"
                      className={`overflow-hidden rounded-lg border bg-white ${
                        activeImage === image ? 'border-[#8f0019]' : 'border-[#e6d4c6]'
                      }`}
                      onClick={() => setSelectedImage(image)}
                    >
                      <img
                        src={image}
                        alt={`${product.productName} thumbnail ${index + 1}`}
                        className="h-14 w-14 object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </article>

            <article className="bg-transparent pt-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#8f0019]">
                {product.category} - {product.subCategory}
              </p>
              <h1 className="mt-2 font-serif text-3xl leading-tight text-[#5b1712] md:text-4xl">
                {product.productName}
              </h1>
              <p className="mt-3 max-w-2xl text-base text-[#6e4f43]">
                {product.details || product.description}
              </p>

              <p className="mt-5 flex items-center gap-3">
                <span className="text-4xl font-bold leading-none text-[#7f2018]">
                  Rs. {product.price?.discountedPrice ?? product.price?.mrp ?? '-'}
                </span>
                <span className="pt-2 text-xl text-[#8f837a] line-through">
                  Rs. {product.price?.mrp ?? '-'}
                </span>
              </p>

              <div className="mt-6 grid grid-cols-1 gap-2 text-[18px] text-[#6e4f43] md:grid-cols-2 md:text-base">
                <p>
                  <span className="font-semibold text-[#5f1f17]">Fabric:</span>{' '}
                  {product.fabric || '-'}
                </p>
                <p>
                  <span className="font-semibold text-[#5f1f17]">Fit:</span>{' '}
                  {product.fit || '-'}
                </p>
                <p>
                  <span className="font-semibold text-[#5f1f17]">Occasion:</span>{' '}
                  {product.occasion || '-'}
                </p>
                <p>
                  <span className="font-semibold text-[#5f1f17]">Sleeves:</span>{' '}
                  {product.sleeves || '-'}
                </p>
              </div>

              <p className="mt-5 text-base leading-8 text-[#6e4f43]">{product.description}</p>

              <h2 className="mt-8 font-serif text-2xl text-[#6f1c15]">Highlights</h2>
              <ul className="mt-3 space-y-2 text-sm text-[#6e4f43]">
                {highlights.map((feature) => (
                  <li key={feature}>• {feature}</li>
                ))}
                {highlights.length === 0 && (
                  <li>• Product highlights will be updated soon.</li>
                )}
              </ul>

              {designDetailEntries.length > 0 && (
                <>
                  <h2 className="mt-8 font-serif text-2xl text-[#6f1c15]">Design Details</h2>
                  <div className="mt-4 space-y-4">
                    {designDetailEntries.map((entry) => (
                      <div key={entry.key}>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8f0019]">
                          {toTitle(entry.key)}
                        </h3>
                        <ul className="mt-2 space-y-1 text-sm text-[#6e4f43]">
                          {entry.values.map((item) => (
                            <li key={`${entry.key}-${item}`}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <h2 className="mt-8 font-serif text-2xl text-[#6f1c15]">Style Tip</h2>
              <p className="mt-3 text-sm leading-7 text-[#6e4f43]">{product.styleTip}</p>
            </article>
          </div>
        </section>
        <div className="mt-10 w-full md:mt-16">
          <HowToOrder product={product} />
        </div>
      </main>
      <Footer />
    </>
  )
}

export default ProductDetailPage
