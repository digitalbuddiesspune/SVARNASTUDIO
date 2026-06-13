import { cloudinarySrcSet, optimizedCloudinaryUrl } from '../utils/cloudinaryImage'

function OptimizedCloudinaryImage({
  src,
  alt,
  className = '',
  widths = [320, 480, 640, 800],
  defaultWidth = 640,
  sizes = '(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 280px',
  loading = 'lazy',
  width,
  height,
  fetchPriority,
}) {
  return (
    <img
      src={optimizedCloudinaryUrl(src, { width: defaultWidth })}
      srcSet={cloudinarySrcSet(src, widths)}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      className={className}
    />
  )
}

export default OptimizedCloudinaryImage
