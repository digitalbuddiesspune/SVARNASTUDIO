import { formatProductPrice, getProductPrices, hasProductDiscount } from '../utils/productPrice'

const SIZE_STYLES = {
  sm: {
    label: 'text-[10px]',
    value: 'text-sm font-semibold',
    mrpValue: 'text-xs',
  },
  md: {
    label: 'text-[10px]',
    value: 'text-base font-semibold',
    mrpValue: 'text-sm',
  },
  lg: {
    label: 'text-xs',
    value: 'text-3xl font-bold leading-none',
    mrpValue: 'text-lg',
  },
}

const VARIANT_STYLES = {
  default: {
    text: 'text-[#5f1f17]',
    primaryLabel: 'text-[#8f0019]',
    mrpLabel: 'text-[#6e4f43]',
    mrpValue: 'text-[#6e4f43]',
  },
  light: {
    text: 'text-[#f8dfcd]',
    primaryLabel: 'text-[#f8dfcd]',
    mrpLabel: 'text-[#e8c9b8]',
    mrpValue: 'text-[#e8c9b8]',
  },
}

function ProductPriceDisplay({ price, size = 'md', variant = 'default', className = '' }) {
  const styles = SIZE_STYLES[size] || SIZE_STYLES.md
  const colors = VARIANT_STYLES[variant] || VARIANT_STYLES.default
  const { mrp, discountedPrice: discounted } = getProductPrices(price)
  const hasDiscount = hasProductDiscount(price)

  if (!hasDiscount) {
    return (
      <div className={`space-y-1 ${colors.text} ${className}`}>
        <p>
          <span
            className={`${styles.label} font-semibold uppercase tracking-wide ${colors.primaryLabel}`}
          >
            Price
          </span>
          <br />
          <span className={styles.value}>Rs. {formatProductPrice(discounted)}</span>
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-1 ${colors.text} ${className}`}>
      <p>
        <span
          className={`${styles.label} font-semibold uppercase tracking-wide ${colors.primaryLabel}`}
        >
          Discounted
        </span>
        <br />
        <span className={styles.value}>Rs. {formatProductPrice(discounted)}</span>
      </p>
      <p>
        <span
          className={`${styles.label} font-semibold uppercase tracking-wide ${colors.mrpLabel}`}
        >
          MRP
        </span>
        <br />
        <span className={`${styles.mrpValue} line-through ${colors.mrpValue}`}>
          Rs. {formatProductPrice(mrp)}
        </span>
      </p>
    </div>
  )
}

export default ProductPriceDisplay
