export function parseProductAmount(raw) {
  if (raw === null || raw === undefined) return null
  const cleaned = String(raw).trim().replace(/,/g, '')
  if (cleaned === '') return null
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : null
}

export function getProductPrices(price) {
  const mrp = parseProductAmount(price?.mrp) ?? 0
  let discounted = parseProductAmount(price?.discountedPrice)

  if (discounted == null && price?.discountPercent != null) {
    const percent = parseProductAmount(price.discountPercent) ?? 0
    discounted = mrp - (mrp * percent) / 100
  }

  if (discounted == null) {
    discounted = mrp
  }

  discounted = Math.min(Math.max(0, discounted), mrp)

  return { mrp, discountedPrice: discounted }
}

export function formatProductPrice(value) {
  const n = parseProductAmount(value)
  if (n == null) return '—'
  return String(n.toLocaleString('en-IN', { maximumFractionDigits: 0 }))
}

export function hasProductDiscount(price) {
  const { mrp, discountedPrice } = getProductPrices(price)
  return mrp > 0 && discountedPrice < mrp
}

export function productSellingPrice(price) {
  const { discountedPrice } = getProductPrices(price)
  return formatProductPrice(discountedPrice)
}
