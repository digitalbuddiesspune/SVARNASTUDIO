import { useEffect, useState } from 'react'

const navLinks = ['About', 'Contact']
const brandLogo =
  'https://res.cloudinary.com/dkq4kvwrr/image/upload/v1777461585/Untitled_design_3_mhica6.png'
const categories = [
  {
    category: 'Sarees',
    subCategories: [
      'Linen Sarees',
      'Cotton Sarees',
      'Silk Blend Sarees',
      'Embroidered Sarees',
      'Printed Sarees',
      'Festive Sarees',
    ],
  },
  {
    category: 'Kurta Sets',
    subCategories: [
      'Straight Kurta Sets',
      'A-line Kurta Sets',
      'Printed Kurta Sets',
      'Embroidered Kurta Sets',
      'Festive Kurta Sets',
      '2-Piece Sets',
      '3-Piece Sets',
    ],
  },
  {
    category: 'Co-ord Sets',
    subCategories: [
      'Printed Co-ord Sets',
      'Casual Co-ord Sets',
      'Lounge Sets',
      'Office Wear Sets',
    ],
  },
  {
    category: 'Tops',
    subCategories: ['Ethnic Tops', 'Printed Tops', 'Crop Tops'],
  },
  
  {
    category: 'Indo-Western',
    subCategories: [
      'Fusion Sets',
      'Cape Sets',
      'Tunic + Pants',
      'Designer Indo-Western',
    ],
  },{
    category: 'Collections',
    subCategories: [
      'Festive Collection',
      'Summer Linen Collection',
      'Office Wear Collection',
      'Wedding Collection',
      'Minimal Everyday Wear',
    ],
  },
]

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    handleScroll()
    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        isScrolled ? 'bg-[#faf7ec] backdrop-blur' : 'bg-transparent'
      }`}
    >
      <div
        className={`mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-4 py-1 md:px-8 ${
          isScrolled
            ? 'text-black'
            : 'text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.75)]'
        }`}
      >
        <div className="flex items-center">
          <img
            src={brandLogo}
            alt="Svarna Studio"
            className="h-14 w-auto md:h-16"
          />
        </div>

        <nav className="hidden items-center justify-center gap-2 md:flex">
          {categories.map((item) => (
            <div key={item.category} className="group relative">
              <button
                type="button"
                className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                  isScrolled
                    ? 'text-black hover:bg-black/10'
                    : 'text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.75)] hover:bg-white/15'
                }`}
              >
                {item.category}
              </button>
              <div className="pointer-events-none absolute left-0 top-full z-50 mt-2 w-60 rounded-xl border border-[#e8cfc1] bg-white p-3 opacity-0 shadow-xl transition duration-150 [text-shadow:none] group-hover:pointer-events-auto group-hover:opacity-100">
                <p className="border-b border-[#f0dfd4] pb-2 text-left text-xs font-semibold uppercase tracking-wider text-[#8f0019]">
                  {item.category}
                </p>
                <ul className="mt-2 space-y-1">
                  {item.subCategories.map((subCategory) => (
                    <li key={subCategory}>
                      <a
                        href="#"
                        className="block rounded-md px-2 py-1.5 text-left text-sm text-[#5e2e25] transition hover:bg-[#f9ece5]"
                      >
                        {subCategory}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </nav>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {navLinks.map((link) => (
            <a
              key={link}
              href="#"
              className={`rounded-full px-3 py-2 transition ${
                isScrolled
                  ? 'text-black hover:bg-black/10'
                  : 'text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.75)] hover:bg-white/15'
              }`}
            >
              {link}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
