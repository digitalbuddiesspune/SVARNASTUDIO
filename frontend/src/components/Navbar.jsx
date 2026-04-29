import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const navLinks = [
  { label: 'Products', path: '/products' },
  { label: 'About', path: null },
  { label: 'Contact', path: null },
]
const brandLogo =
  'https://res.cloudinary.com/dkq4kvwrr/image/upload/v1777467131/suvarnaStudiologo_cojcd7.png'
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const isHomePage = location.pathname === '/'
  const useLightNavbar = isScrolled || !isHomePage

  useEffect(() => {
    const desktopMediaQuery = window.matchMedia('(min-width: 768px)')

    const handleDesktopScroll = () => {
      if (!desktopMediaQuery.matches) {
        setIsScrolled(false)
        return
      }
      setIsScrolled(window.scrollY > 10)
    }

    handleDesktopScroll()
    window.addEventListener('scroll', handleDesktopScroll)
    desktopMediaQuery.addEventListener('change', handleDesktopScroll)

    return () => {
      window.removeEventListener('scroll', handleDesktopScroll)
      desktopMediaQuery.removeEventListener('change', handleDesktopScroll)
    }
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname, location.search, location.hash])

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        useLightNavbar
          ? 'bg-[#f9ece5] md:bg-[#faf7ec] backdrop-blur'
          : 'bg-[#f9ece5] md:bg-black/20 md:backdrop-transparent'
      }`}
    >
      <div
        className={`mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-2 md:gap-6 md:px-8 md:py-3 ${
          useLightNavbar
            ? 'text-black'
            : 'text-black md:text-white'
        }`}
      >
        <Link to="/" className="flex items-center" aria-label="Go to home page">
          <img
            src={brandLogo}
            alt="Svarna Studio"
            className="h-8 w-auto md:h-11"
          />
        </Link>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
          className="rounded-lg p-1.5 hover:bg-black/10 md:hidden"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
        >
          {isMobileMenuOpen ? (
            <span className="block text-xl leading-none">✕</span>
          ) : (
            <>
              <span className="block h-0.5 w-5 bg-current" />
              <span className="mt-1 block h-0.5 w-5 bg-current" />
              <span className="mt-1 block h-0.5 w-5 bg-current" />
            </>
          )}
        </button>

        <nav className="hidden items-center justify-center gap-2 md:flex">
          {categories.map((item) => (
            <div key={item.category} className="group relative">
              <Link
                to={`/products?category=${encodeURIComponent(item.category)}`}
                className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                  useLightNavbar
                    ? 'text-black hover:bg-black/10'
                    : 'text-white hover:bg-white/15'
                }`}
              >
                {item.category}
              </Link>
              <div className="pointer-events-none absolute left-0 top-full z-50 mt-2 w-60 rounded-xl border border-[#e8cfc1] bg-white p-3 opacity-0 shadow-xl transition duration-150 [text-shadow:none] group-hover:pointer-events-auto group-hover:opacity-100">
                <p className="border-b border-[#f0dfd4] pb-2 text-left text-xs font-semibold uppercase tracking-wider text-[#8f0019]">
                  {item.category}
                </p>
                <ul className="mt-2 space-y-1">
                  {item.subCategories.map((subCategory) => (
                    <li key={subCategory}>
                      <Link
                        to={`/products?category=${encodeURIComponent(item.category)}&subCategory=${encodeURIComponent(subCategory)}`}
                        className="block rounded-md px-2 py-1.5 text-left text-sm text-[#5e2e25] transition hover:bg-[#f9ece5]"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {subCategory}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </nav>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {navLinks.map((link) => (
            link.path ? (
              <Link
                key={link.label}
                to={link.path}
                className={`rounded-full px-3 py-2 transition ${
                  useLightNavbar
                    ? 'text-black hover:bg-black/10'
                    : 'text-white hover:bg-white/15'
                }`}
              >
                {link.label}
              </Link>
            ) : (
              <button
                key={link.label}
                type="button"
                className={`rounded-full px-3 py-2 transition ${
                  useLightNavbar
                    ? 'text-black hover:bg-black/10'
                    : 'text-white hover:bg-white/15'
                }`}
              >
                {link.label}
              </button>
            )
          ))}
        </nav>
      </div>

      <div
        className={`fixed inset-0 z-[60] bg-black/45 backdrop-blur-[1px] transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <aside
        className={`fixed right-0 top-0 z-[70] h-dvh w-[88%] max-w-sm bg-[#faf7ec] shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#e7dbc8] px-4 py-4">
          <p className="text-sm font-semibold tracking-wide text-[#5f1f17]">Menu</p>
          <button
            type="button"
            aria-label="Close menu"
            className="rounded-lg p-2 text-[#5f1f17] hover:bg-[#f1dfd3]"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            ✕
          </button>
        </div>

        <div className="h-[calc(100vh-68px)] overflow-y-auto px-4 pb-6 pt-3">
          <div className="space-y-2">
            {categories.map((item) => (
              <details
                key={item.category}
                className="rounded-xl border border-[#eadbcb] bg-white"
              >
                <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-[#5f1f17]">
                  {item.category}
                </summary>
                <ul className="border-t border-[#f3e6d8] px-2 py-2">
                  <li>
                    <Link
                      to={`/products?category=${encodeURIComponent(item.category)}`}
                      className="block rounded-md px-3 py-2 text-sm font-semibold text-[#5f1f17] transition hover:bg-[#f9ece5]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      View all {item.category}
                    </Link>
                  </li>
                  {item.subCategories.map((subCategory) => (
                    <li key={subCategory}>
                      <Link
                        to={`/products?category=${encodeURIComponent(item.category)}&subCategory=${encodeURIComponent(subCategory)}`}
                        className="block rounded-md px-3 py-2 text-sm text-[#6f4d42] transition hover:bg-[#f9ece5]"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {subCategory}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {navLinks.map((link) =>
              link.path ? (
                <Link
                  key={link.label}
                  to={link.path}
                  className="rounded-full border border-[#ddc9b5] px-3 py-2 text-center text-sm font-medium text-[#5f1f17]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ) : (
                <button
                  key={link.label}
                  type="button"
                  className="rounded-full border border-[#ddc9b5] px-3 py-2 text-center text-sm font-medium text-[#5f1f17]"
                >
                  {link.label}
                </button>
              )
            )}
          </div>
        </div>
      </aside>
    </header>
  )
}

export default Navbar
