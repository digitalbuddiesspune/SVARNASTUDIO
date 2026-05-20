import { productCategoryLabel } from './productCategory'

/** Build `/products` URL with category and optional subcategory query params. */
export function productsFilterPath(categoryName, subCategoryName = '') {
  const params = new URLSearchParams()
  const cat = String(categoryName || '').trim()
  if (!cat) return '/products'
  params.set('category', cat)
  const sub = String(subCategoryName || '').trim()
  if (sub) params.set('subCategory', sub)
  return `/products?${params.toString()}`
}

/** Match API list to URL filters (case-insensitive). */
export function filterProductsByQuery(products, { category = '', subCategory = '', fabric = '' } = {}) {
  if (!Array.isArray(products)) return []
  let list = products
  const cat = String(category || '').trim()
  const sub = String(subCategory || '').trim()
  const fab = String(fabric || '').trim()

  if (cat) {
    const catLower = cat.toLowerCase()
    list = list.filter(
      (p) => productCategoryLabel(p.category).trim().toLowerCase() === catLower
    )
  }
  if (sub) {
    const subLower = sub.toLowerCase()
    list = list.filter(
      (p) => String(p.subCategory || '').trim().toLowerCase() === subLower
    )
  }
  if (fab) {
    const fabLower = fab.toLowerCase()
    list = list.filter(
      (p) => String(p.fabric || '').trim().toLowerCase() === fabLower
    )
  }
  return list
}
