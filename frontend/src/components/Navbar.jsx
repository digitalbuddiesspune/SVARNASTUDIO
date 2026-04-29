const navLinks = ['Home', 'New', 'Shop', 'About', 'Connect']
const navIcons = ['Search', 'Wishlist', 'Cart', 'Account']
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
  },
]

function Navbar() {
  return (
    <>
      <header className="relative z-40 bg-[#000000]/25 backdrop-blur">
        <div className="mx-auto border-b border-black/5 flex w-full max-w-7xl items-center justify-between gap-6 px-4 py-4 text-white md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#87081b] text-lg font-semibold">
              n
            </div>
            <span className="font-serif text-xl tracking-wide">Neha Saree</span>
          </div>

          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            {navLinks.map((link) => (
              <a key={link} href="#" className="transition hover:text-[#f8d7cb]">
                {link}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-4 text-xs md:flex">
            {navIcons.map((icon) => (
              <button
                key={icon}
                type="button"
                className="rounded-full border border-white/40 px-3 py-1 transition hover:border-white hover:bg-white/10"
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="sticky top-0 z-50 bg-[#000000]/25 backdrop-blur">
        <div className="mx-auto hidden w-full max-w-7xl items-center justify-start gap-2 px-4 py-2 md:flex md:px-8">
          {categories.map((item) => (
            <div key={item.category} className="group relative">
              <button
                type="button"
                className="rounded-full px-4 py-2 text-left text-sm font-medium text-white transition hover:bg-white/15"
              >
                {item.category}
              </button>
              <div className="pointer-events-none absolute left-0 top-full z-50 mt-2 w-60 rounded-xl border border-[#e8cfc1] bg-white p-3 opacity-0 shadow-xl transition duration-150 group-hover:pointer-events-auto group-hover:opacity-100">
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
        </div>
      </div>
    </>
  )
}

export default Navbar
