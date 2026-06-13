import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  cloudinarySrcSet,
  optimizedCloudinaryUrl,
  preloadCloudinaryImage,
} from '../utils/cloudinaryImage'

const heroImages = [
  'https://res.cloudinary.com/dkq4kvwrr/image/upload/v1777457829/ChatGPT_Image_Apr_29_2026_03_43_49_PM_1_cbgkqk.png',
  'https://res.cloudinary.com/dkq4kvwrr/image/upload/v1777461795/ChatGPT_Image_Apr_29_2026_04_52_31_PM_1_muwm5r.png',
  'https://res.cloudinary.com/dkq4kvwrr/image/upload/v1777462958/ChatGPT_Image_Apr_29_2026_05_12_01_PM_1_ceyedn.png',
  'https://res.cloudinary.com/dkq4kvwrr/image/upload/v1777466389/ChatGPT_Image_Apr_29_2026_06_09_09_PM_2_md8ik6.png',
  'https://res.cloudinary.com/dkq4kvwrr/image/upload/v1777466732/ChatGPT_Image_Apr_29_2026_06_14_49_PM_1_qwnfgs.png',
]

function HeroSection() {
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [loadedIndexes, setLoadedIndexes] = useState(() => new Set([0, 1]))

  const optimizedHeroImages = useMemo(
    () =>
      heroImages.map((image) => ({
        src: optimizedCloudinaryUrl(image, { width: 1920 }),
        srcSet: cloudinarySrcSet(image),
      })),
    []
  )

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length)
    }, 3000)

    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const nextIndex = (activeImageIndex + 1) % heroImages.length
    setLoadedIndexes((prev) => {
      if (prev.has(activeImageIndex) && prev.has(nextIndex)) return prev
      const next = new Set(prev)
      next.add(activeImageIndex)
      next.add(nextIndex)
      return next
    })
    preloadCloudinaryImage(heroImages[nextIndex], 1920)
  }, [activeImageIndex])

  return (
    <section className="relative mt-0 aspect-[4/4] overflow-hidden md:-mt-[96px] md:h-[85vh] md:aspect-auto">
      <div className="absolute inset-0">
        {optimizedHeroImages.map(({ src, srcSet }, index) => {
          const isActive = index === activeImageIndex
          const shouldLoad = loadedIndexes.has(index)

          if (!shouldLoad) return null

          return (
            <img
              key={heroImages[index]}
              src={src}
              srcSet={srcSet}
              sizes="100vw"
              alt="Elegant ethnic wear collection"
              width={1920}
              height={1080}
              decoding="async"
              loading={index === 0 ? 'eager' : 'lazy'}
              fetchPriority={index === 0 ? 'high' : 'auto'}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )
        })}
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-[#2f130e]/65 via-[#602c20]/25 to-transparent" />

      <div className="absolute inset-0 z-10 flex flex-col">
        <div className="mx-auto flex w-full max-w-7xl flex-1 items-end px-4 pb-8 pt-16 md:items-center md:px-8 md:pb-24 md:pt-32">
          <div className="max-w-xl text-white">
            <h1 className="pt-0 font-serif text-2xl leading-tight md:pt-10 md:text-6xl">
              Grace in Every Drape.
            </h1>
            <p className="mt-3 hidden max-w-xs text-xs text-[#fbece4] md:mt-4 md:block md:max-w-md md:text-base">
              Discover handcrafted sarees designed to celebrate timeless elegance
              with modern charm.
            </p>
            <Link
              to="/products"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#8f0019] px-5 py-2 text-xs font-semibold text-white shadow-lg transition hover:bg-[#730014] md:mt-7 md:px-8 md:py-3 md:text-sm"
            >
              Explore Collection
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
