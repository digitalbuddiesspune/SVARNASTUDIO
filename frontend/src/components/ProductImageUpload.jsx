import { useMemo, useState } from 'react'
import { API_BASE_URL } from '../config/api'

function parseImageUrls(raw) {
  return String(raw || '')
    .split(/[\n,]/)
    .map((value) => value.trim())
    .filter(Boolean)
}

function ProductImageUpload({ imageUrls, onImageUrlsChange, idPrefix = 'product' }) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const urls = useMemo(() => parseImageUrls(imageUrls), [imageUrls])

  const setUrls = (nextUrls) => {
    onImageUrlsChange(nextUrls.join('\n'))
  }

  const handleFilesSelected = async (event) => {
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    if (files.length === 0) return

    setUploading(true)
    setUploadError('')
    try {
      const body = new FormData()
      files.forEach((file) => body.append('images', file))

      const response = await fetch(`${API_BASE_URL}/api/upload/product-images`, {
        method: 'POST',
        body,
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.message || 'Image upload failed')
      }

      const uploaded = Array.isArray(data.urls) ? data.urls : []
      if (uploaded.length === 0) {
        throw new Error('No image URLs returned from server')
      }

      setUrls([...urls, ...uploaded])
    } catch (error) {
      setUploadError(error.message || 'Could not upload images')
    } finally {
      setUploading(false)
    }
  }

  const removeUrl = (index) => {
    setUrls(urls.filter((_, i) => i !== index))
  }

  const inputId = `${idPrefix}-image-upload`

  return (
    <div className="mt-3 space-y-3">
      <div>
        <label
          htmlFor={inputId}
          className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#5f1f17]"
        >
          Product images
        </label>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          multiple
          disabled={uploading}
          onChange={handleFilesSelected}
          className="block w-full text-sm text-[#5f1f17] file:mr-3 file:rounded-lg file:border-0 file:bg-[#8f0019] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#730014] disabled:opacity-60"
        />
        <p className="mt-1 text-xs text-[#7a5b4f]">
          {uploading ? 'Uploading to Cloudinary…' : 'Select one or more images (max 8 MB each).'}
        </p>
        {uploadError ? <p className="mt-1 text-xs text-red-700">{uploadError}</p> : null}
      </div>

      {urls.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {urls.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="overflow-hidden rounded-lg border border-[#eadbcb] bg-[#fdfcfa]"
            >
              <img src={url} alt={`Product ${index + 1}`} className="h-24 w-full object-cover" />
              <button
                type="button"
                onClick={() => removeUrl(index)}
                className="w-full border-t border-[#eadbcb] bg-white px-2 py-1 text-xs font-semibold text-[#8f0019] hover:bg-[#fff5f5]"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div>
        <label
          htmlFor={`${idPrefix}-image-urls`}
          className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#5f1f17]"
        >
          Image URLs (optional)
        </label>
        <textarea
          id={`${idPrefix}-image-urls`}
          placeholder="Or paste image URLs (one per line)"
          value={imageUrls}
          onChange={(event) => onImageUrlsChange(event.target.value)}
          className="min-h-20 w-full rounded-lg border border-[#ddc9b5] px-3 py-2 text-sm outline-none ring-[#8f0019]/30 focus:ring"
        />
      </div>
    </div>
  )
}

export default ProductImageUpload
