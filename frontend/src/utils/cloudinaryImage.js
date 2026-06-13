const CLOUDINARY_UPLOAD = '/upload/'

/** Strip existing transforms; keep from version (v123/...) or public id onward. */
function cloudinaryAssetPath(pathAfterUpload) {
  const versionMatch = pathAfterUpload.match(/v\d+\/.+/)
  if (versionMatch) {
    return versionMatch[0]
  }

  return pathAfterUpload.replace(
    /^((q_[^,/]+|f_[^,/]+|w_[^,/]+|c_[^,/]+|dpr_[^,/]+)[,/])+/i,
    ''
  )
}

/**
 * Cloudinary delivery URL — WebP/AVIF + smart compression, visual quality preserved.
 * Uses q_auto:best (not eco) so images look the same as originals.
 */
export function optimizedCloudinaryUrl(url, { width = 1920, quality = 'auto:best' } = {}) {
  if (!url || typeof url !== 'string') return url
  if (!url.includes('res.cloudinary.com') || !url.includes(CLOUDINARY_UPLOAD)) {
    return url
  }

  const [base, pathAfterUpload] = url.split(CLOUDINARY_UPLOAD)
  if (!pathAfterUpload) return url

  const assetPath = cloudinaryAssetPath(pathAfterUpload)
  if (!assetPath) return url

  const transforms = [`q_${quality}`, 'f_auto', `w_${width},c_limit`, 'dpr_auto'].join(',')
  return `${base}${CLOUDINARY_UPLOAD}${transforms}/${assetPath}`
}

export function cloudinarySrcSet(url, widths = [640, 1024, 1536, 1920], options = {}) {
  return widths
    .map((width) => `${optimizedCloudinaryUrl(url, { width, ...options })} ${width}w`)
    .join(', ')
}

export function preloadCloudinaryImage(url, width = 1920) {
  if (typeof window === 'undefined' || !url) return
  const img = new Image()
  img.src = optimizedCloudinaryUrl(url, { width })
}
