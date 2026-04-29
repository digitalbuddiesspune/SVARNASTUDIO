import { useEffect, useState } from 'react'

const heroImages = [
  'https://res.cloudinary.com/dkq4kvwrr/image/upload/v1777457829/ChatGPT_Image_Apr_29_2026_03_43_49_PM_1_cbgkqk.png',
  'https://res.cloudinary.com/dkq4kvwrr/image/upload/v1777461795/ChatGPT_Image_Apr_29_2026_04_52_31_PM_1_muwm5r.png',
]

function HeroSection() {
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length)
    }, 3000)

    return () => clearInterval(intervalId)
  }, [])

  return (
    <section className="relative -mt-[96px] h-[85vh] overflow-hidden">
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <img
            key={image}
            src={image}
            alt="Elegant ethnic wear collection"
            className={`absolute inset-0 h-auto w-full transition-opacity duration-1000 ease-in-out ${
              index === activeImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-[#2f130e]/65 via-[#602c20]/25 to-transparent" />

      <div className="absolute inset-0 z-10 flex flex-col">
        <div className="mx-auto flex w-full max-w-7xl flex-1 items-center px-4 pb-16 pt-24 md:px-8 md:pb-24 md:pt-32">
          <div className="max-w-xl text-white">
            <h1 className="font-serif text-4xl leading-tight md:text-6xl pt-10">
              Grace in Every Drape.
            </h1>
            <p className="mt-4 max-w-md text-sm text-[#fbece4] md:text-base">
              Discover handcrafted sarees designed to celebrate timeless elegance
              with modern charm.
            </p>
            <button
              type="button"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#8f0019] px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#730014]"
            >
              Explore Collection
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
