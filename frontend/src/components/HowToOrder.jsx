function WhatsAppIcon({ className = 'h-7 w-7' }) {
  return (
    <svg
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        fill="#25D366"
        d="M16 .5C7.44.5.5 7.44.5 16c0 2.82.74 5.46 2.03 7.75L.5 31.5l7.94-2.03A15.43 15.43 0 0 0 16 31.5C24.56 31.5 31.5 24.56 31.5 16S24.56.5 16 .5Z"
      />
      <path
        fill="#fff"
        d="M23.4 19.6c-.4-.2-2.2-1.1-2.5-1.2-.3-.1-.6-.2-.8.2-.2.3-.9 1.2-1.1 1.4-.2.2-.4.2-.7.1-.4-.2-1.6-.6-3-1.9-1.1-1-1.9-2.2-2.1-2.6-.2-.4 0-.6.2-.7.2-.2.4-.4.6-.7.2-.2.2-.4.4-.6.1-.2 0-.5 0-.7 0-.2-.8-2-1.1-2.7-.3-.7-.6-.6-.8-.6h-.7c-.2 0-.6.1-.9.5s-1.2 1.2-1.2 2.9 1.2 3.4 1.4 3.6c.2.2 2.4 3.7 5.8 5 .8.3 1.5.5 2 .7.8.2 1.6.2 2.2.1.7-.1 2.2-.9 2.5-1.7.3-.8.3-1.6.2-1.7 0-.1-.3-.2-.7-.4Z"
      />
    </svg>
  )
}

function InstagramIcon({ className = 'h-7 w-7' }) {
  return (
    <svg
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ig-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#feda75" />
          <stop offset="35%" stopColor="#fa7e1e" />
          <stop offset="65%" stopColor="#d62976" />
          <stop offset="100%" stopColor="#962fbf" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="7" fill="url(#ig-grad)" />
      <circle cx="16" cy="16" r="6.2" fill="none" stroke="#fff" strokeWidth="2" />
      <circle cx="23" cy="9" r="1.6" fill="#fff" />
    </svg>
  )
}

const steps = [
  {
    title: 'Choose Your Style',
    description: 'Browse our collection and pick your favorite.',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7" aria-hidden="true">
        <path
          d="M9 11h14l-1.5 14a2 2 0 0 1-2 1.8H12.5a2 2 0 0 1-2-1.8L9 11Z"
          stroke="#8f0019"
          strokeWidth="1.6"
        />
        <path
          d="M12.5 11V8.5a3.5 3.5 0 1 1 7 0V11"
          stroke="#8f0019"
          strokeWidth="1.6"
        />
        <path d="M16 17.5l1.2 1.4L19 17l-3 3-3-3 1.8 1.9L16 17.5Z" fill="#e1316a" />
      </svg>
    ),
  },
  {
    title: 'Contact Us',
    description: 'Message us on WhatsApp or Instagram with the product details.',
    icon: <WhatsAppIcon className="h-7 w-7" />,
  },
  {
    title: 'Confirm Your Order',
    description: 'Our team will confirm availability, price and all details with you.',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7" aria-hidden="true">
        <rect
          x="8"
          y="6.5"
          width="16"
          height="19"
          rx="2"
          stroke="#8f0019"
          strokeWidth="1.6"
        />
        <path d="M12 5h8v3h-8z" fill="#8f0019" />
        <path
          d="M11.5 13.5h9M11.5 17h9M11.5 20.5h6"
          stroke="#8f0019"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: 'We Pack & Ship',
    description: 'Once confirmed, we pack your order with care and ship it to you.',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7" aria-hidden="true">
        <path
          d="M5 11.5 16 6l11 5.5v9L16 26 5 20.5v-9Z"
          stroke="#8f0019"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M5 11.5 16 17l11-5.5M16 17v9" stroke="#8f0019" strokeWidth="1.6" />
        <path d="M14.5 19c.5 1.4 2.5 1.4 3 0" stroke="#e1316a" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'You Receive & Enjoy',
    description: 'Receive your order and enjoy your new look!',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7" aria-hidden="true">
        <circle cx="16" cy="12" r="5" stroke="#8f0019" strokeWidth="1.6" />
        <path
          d="M7 26c1.6-4.5 5.2-7 9-7s7.4 2.5 9 7"
          stroke="#8f0019"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path d="M15 19c.5 1 1.5 1 2 0" stroke="#e1316a" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
]

function HowToOrder({ product = null }) {
  const phoneNumber = '917350495906'
  const instagramLink = 'https://instagram.com/svarnastudio'

  const buildWhatsappLink = () => {
    if (!product) {
      return `https://wa.me/${phoneNumber}`
    }
    const productUrl =
      typeof window !== 'undefined' ? window.location.href : ''
    const price =
      product?.price?.discountedPrice ?? product?.price?.mrp ?? null
    const lines = [
      'Hi! I would like to place an order for this product:',
      '',
      `*${product.productName || 'Product'}*`,
      product.category ? `Category: ${product.category}` : null,
      product.subCategory ? `Sub-category: ${product.subCategory}` : null,
      price ? `Price: Rs. ${price}` : null,
      productUrl ? `Link: ${productUrl}` : null,
      '',
      'Please share the availability and next steps. Thank you!',
    ].filter(Boolean)
    const message = lines.join('\n')
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
  }

  const whatsappLink = buildWhatsappLink()

  return (
    <section className="text-[#3d2418]">
      <div className="relative bg-[#fbf6ee] md:hidden">
        <div className="aspect-[9/14] w-full overflow-hidden">
          <img
            src="https://res.cloudinary.com/dzd47mpdo/image/upload/v1778590274/ChatGPT_Image_May_12_2026_06_19_38_PM_1_jgesrz.png"
            alt="Order via WhatsApp"
            className="h-full w-full object-cover object-bottom"
            loading="lazy"
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#fbf6ee] via-[#fbf6ee]/95 to-transparent px-5 pb-3 pt-8 text-left">
          <p className="text-xs font-semibold uppercase tracking-[3px] text-[#8a6a55]">
            How to Order
          </p>
          <h2 className="mt-2 font-serif text-3xl leading-tight text-[#2c1810]">
            Ordering is simple!
          </h2>
          <span className="mt-3 block h-[2px] w-14 bg-[#c4a261]" />
          <p className="mt-4 text-xs leading-6 text-[#5b4636]">
            We are not accepting online payments right now. You can place your order
            easily through WhatsApp or Instagram. Our team will assist you personally.
          </p>
          <p className="mt-4 font-serif text-lg italic text-[#7a5b4f]">
            We&apos;re here to help you!{' '}
            <span className="text-[#c4a261]">♡</span>
          </p>
        </div>
      </div>

      <div
        className="relative hidden w-full bg-[#fbf6ee] md:block"
        style={{
          backgroundImage:
            "url('https://res.cloudinary.com/dzd47mpdo/image/upload/v1778587971/ChatGPT_Image_May_12_2026_05_40_24_PM_1_b5g710.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'right top',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-8 pb-24 pt-20 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[3px] text-[#8a6a55]">
              How to Order
            </p>
            <h2 className="mt-2 font-serif text-5xl leading-tight text-[#2c1810]">
              Ordering is simple!
            </h2>
            <span className="mt-3 block h-[2px] w-16 bg-[#c4a261]" />
            <p className="mt-5 max-w-md text-[15px] leading-7 text-[#5b4636]">
              We are not accepting online payments right now. You can place your order
              easily through WhatsApp or Instagram. Our team will assist you personally.
            </p>
            <p className="mt-6 font-serif text-xl italic text-[#7a5b4f]">
              We&apos;re here to help you!{' '}
              <span className="text-[#c4a261]">♡</span>
            </p>
          </div>

          <div aria-hidden="true" />
        </div>
      </div>

      <div className="bg-[#fdfaf3]">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 md:px-8 md:py-12">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[3px] text-[#5b4636] md:text-sm">
              Ways to Place Your Order
            </p>
            <span className="mx-auto mt-2 block h-[2px] w-16 bg-[#c4a261]" />
          </div>

          <div className="mt-8 grid items-stretch gap-6 md:grid-cols-[1fr_auto_1fr] md:gap-4">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-5 rounded-2xl border border-[#cfe1c8] bg-[#eef5e7] p-5 shadow-sm transition hover:shadow-md md:p-6"
            >
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white shadow-sm">
                <WhatsAppIcon className="h-8 w-8" />
              </span>
              <div className="flex-1">
                <p className="font-semibold uppercase tracking-wider text-[#2c1810]">
                  Order on WhatsApp
                </p>
                <p className="mt-1 text-sm leading-6 text-[#5b4636]">
                  Chat with us on WhatsApp to place your order.
                </p>
                <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#1e5b2e] px-4 py-2 text-xs font-semibold text-white">
                  Chat on WhatsApp
                  <span aria-hidden="true">›</span>
                </span>
              </div>
            </a>

            <div className="hidden flex-col items-center justify-center md:flex">
              <span className="h-full w-px border-l border-dashed border-[#d9c7a8]" />
              <span className="my-2 grid h-9 w-9 place-items-center rounded-full bg-[#fdfaf3] text-xs font-semibold uppercase tracking-wider text-[#8a6a55]">
                or
              </span>
              <span className="h-full w-px border-l border-dashed border-[#d9c7a8]" />
            </div>
            <div className="flex items-center justify-center md:hidden">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8a6a55]">
                or
              </span>
            </div>

            <a
              href={instagramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-5 rounded-2xl border border-[#f4d6df] bg-[#fbe9ef] p-5 shadow-sm transition hover:shadow-md md:p-6"
            >
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white shadow-sm">
                <InstagramIcon className="h-8 w-8" />
              </span>
              <div className="flex-1">
                <p className="font-semibold uppercase tracking-wider text-[#2c1810]">
                  Order on Instagram
                </p>
                <p className="mt-1 text-sm leading-6 text-[#5b4636]">
                  DM us on Instagram to place your order.
                </p>
                <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#a82a55] px-4 py-2 text-xs font-semibold text-white">
                  Message on Instagram
                  <span aria-hidden="true">›</span>
                </span>
              </div>
            </a>
          </div>

          <div className="mt-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-[3px] text-[#5b4636] md:text-sm">
              How It Works
            </p>
            <span className="mx-auto mt-2 block h-[2px] w-16 bg-[#c4a261]" />
          </div>

          <div className="relative mt-8 grid gap-8 sm:grid-cols-2 md:grid-cols-5 md:gap-4">
            {steps.map((step, index) => (
              <div key={step.title} className="relative flex flex-col items-center text-center">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-[#f6ecd9] shadow-sm">
                  {step.icon}
                </span>
                <h3 className="mt-4 text-sm font-semibold text-[#2c1810]">
                  {index + 1}. {step.title}
                </h3>
                <p className="mt-2 max-w-[200px] text-xs leading-5 text-[#5b4636] md:text-[13px] md:leading-5">
                  {step.description}
                </p>
                {index < steps.length - 1 && (
                  <span
                    className="pointer-events-none absolute top-8 hidden h-px w-full bg-[#e7d9bd] md:block"
                    style={{ left: '50%' }}
                    aria-hidden="true"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-between gap-4 rounded-2xl bg-[#fdf2e9] px-5 py-4 text-[#5b4636]">
            <div className="flex items-center gap-3">
              <span className="text-xl text-[#e36a86]" aria-hidden="true">
                ♥
              </span>
              <p className="text-sm leading-6">
                <span className="font-semibold text-[#2c1810]">
                  Thank you for supporting Svarna Studio.
                </span>{' '}
                We promise a personal, warm and trustworthy shopping experience.
              </p>
            </div>
            <span className="hidden text-xl text-[#c4a261] md:inline" aria-hidden="true">
              ✦
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowToOrder
