const brandLogo =
  'https://res.cloudinary.com/dkq4kvwrr/image/upload/v1777461585/Untitled_design_3_mhica6.png'

function Footer() {
  return (
    <footer className="bg-[#4e1e17] text-[#f8e7dc]">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 md:grid-cols-3 md:px-8">
        <div>
          <img
            src={brandLogo}
            alt="Svarna Studio"
            className="h-12 w-auto md:h-14"
          />
          <p className="mt-3 text-sm leading-6 text-[#f4d3c5]">
            Timeless sarees crafted for every celebration and every day elegance.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-[#ffd8c8]">
            Quick Links
          </h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>Home</li>
            <li>Shop</li>
            <li>About Us</li>
            <li>Contact</li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-[#ffd8c8]">
            Contact
          </h4>
          <p className="mt-3 text-sm text-[#f4d3c5]">support@nehasaree.com</p>
          <p className="mt-1 text-sm text-[#f4d3c5]">+91 98765 43210</p>
          <p className="mt-1 text-sm text-[#f4d3c5]">Mon - Sat, 10 AM - 7 PM</p>
        </div>
      </div>
      <div className="border-t border-[#7d4436] px-4 py-4 text-center text-xs text-[#f1c8b7]">
        Copyright {new Date().getFullYear()} Svarna Studio. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer
