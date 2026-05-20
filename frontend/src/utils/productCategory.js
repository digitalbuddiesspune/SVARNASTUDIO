/** Product.category may be a populated { _id, name, imageUrl } or a legacy string. */
export function productCategoryLabel(category) {
  if (category == null || category === '') return ''
  if (typeof category === 'object' && category !== null && category.name != null) {
    return String(category.name)
  }
  return String(category)
}
