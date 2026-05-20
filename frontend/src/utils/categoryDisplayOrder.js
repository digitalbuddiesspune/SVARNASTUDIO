/**
 * Fixed category order for nav + admin lists (matches main shop sections).
 * Any other category name appears after these, sorted A–Z.
 */
export const CATEGORY_DISPLAY_ORDER = [
  'Sarees',
  'Kurta Sets',
  'Co-ord Sets',
  'Tops',
  'Indo-Western',
  'Collections',
]

/**
 * @param {Array} items
 * @param {(item: object) => string} [getName] defaults to `name` or `category` field
 */
export function sortCategoriesByDisplayOrder(
  items,
  getName = (c) => String(c?.name ?? c?.category ?? '').trim()
) {
  if (!Array.isArray(items)) return []
  const rank = (name) => {
    const i = CATEGORY_DISPLAY_ORDER.findIndex(
      (label) => label.toLowerCase() === name.toLowerCase()
    )
    return i === -1 ? CATEGORY_DISPLAY_ORDER.length : i
  }
  return [...items].sort((a, b) => {
    const na = getName(a)
    const nb = getName(b)
    const ra = rank(na)
    const rb = rank(nb)
    if (ra !== rb) return ra - rb
    return na.localeCompare(nb)
  })
}
