import Footer from '../components/Footer'

const PHONE_NUMBERS = ['+91 73504 95906', '+91 86686 56703']
const EMAIL_ADDRESS = 'contact@svarnastudio.in'
const LOCATION =
  'Ganesha Residency, Bhole Baba Nagar, Uday Nagar, Nagpur'
const WHATSAPP_LINK = 'https://wa.me/917350495906'
const INSTAGRAM_LINK = 'https://instagram.com/svarnastudio'

function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path
        d="M5 4.5a1.5 1.5 0 0 1 1.5-1.5h2.1a1.5 1.5 0 0 1 1.46 1.15l.7 2.9a1.5 1.5 0 0 1-.42 1.48l-1.34 1.27a13 13 0 0 0 6.2 6.2l1.27-1.34a1.5 1.5 0 0 1 1.48-.42l2.9.7A1.5 1.5 0 0 1 21 16.4v2.1a1.5 1.5 0 0 1-1.5 1.5A14.5 14.5 0 0 1 5 5.5v-1Z"
        stroke="#8f0019"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="#8f0019" strokeWidth="1.6" />
      <path d="m4 7 8 6 8-6" stroke="#8f0019" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path
        d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z"
        stroke="#8f0019"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.5" r="2.5" stroke="#8f0019" strokeWidth="1.6" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true">
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

function InstagramIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true">
      <defs>
        <linearGradient id="ig-contact-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#feda75" />
          <stop offset="35%" stopColor="#fa7e1e" />
          <stop offset="65%" stopColor="#d62976" />
          <stop offset="100%" stopColor="#962fbf" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="7" fill="url(#ig-contact-grad)" />
      <circle cx="16" cy="16" r="6.2" fill="none" stroke="#fff" strokeWidth="2" />
      <circle cx="23" cy="9" r="1.6" fill="#fff" />
    </svg>
  )
}

function ContactUsPage() {
  return (
    <>
      <main className="bg-[#faf6ee] text-[#3d2418]">
        <section className="relative overflow-hidden bg-[#f7ecd9]">
          <div className="mx-auto w-full max-w-5xl px-4 pb-10 pt-14 text-center md:px-8 md:pb-14 md:pt-20">
            <p className="text-xs font-semibold uppercase tracking-[4px] text-[#8a6a55]">
              We&apos;d love to hear from you
            </p>
            <h1 className="mt-3 font-serif text-4xl leading-tight text-[#2c1810] md:text-6xl">
              Contact Us
            </h1>
            <div className="mx-auto mt-4 flex w-fit items-center gap-3 text-[#8f1328]">
              <span className="h-px w-16 bg-[#8f1328]/70 md:w-24" />
              <span className="text-lg leading-none">❦</span>
              <span className="h-px w-16 bg-[#8f1328]/70 md:w-24" />
            </div>
            <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[#5b4636] md:text-base md:leading-8">
              Whether you have a question about our collections, orders, or anything else,
              our team is always here to help. Get in touch for support, collaborations, or
              general enquiries — we&apos;ll respond as soon as possible.
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 pb-16 pt-10 md:px-8 md:pb-20 md:pt-14">
          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-[#e7d9bd] bg-white p-6 text-center shadow-sm">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#fbeef0]">
                <PhoneIcon />
              </span>
              <h3 className="mt-4 font-serif text-lg text-[#6f1b1d]">Phone</h3>
              <div className="mt-2 space-y-1 text-sm text-[#5b4636]">
                {PHONE_NUMBERS.map((number) => (
                  <p key={number}>
                    <a
                      href={`tel:${number.replace(/\s+/g, '')}`}
                      className="transition hover:text-[#8f0019]"
                    >
                      {number}
                    </a>
                  </p>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#e7d9bd] bg-white p-6 text-center shadow-sm">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#fbeef0]">
                <MailIcon />
              </span>
              <h3 className="mt-4 font-serif text-lg text-[#6f1b1d]">Email</h3>
              <p className="mt-2 text-sm text-[#5b4636]">
                <a
                  href={`mailto:${EMAIL_ADDRESS}`}
                  className="break-all transition hover:text-[#8f0019]"
                >
                  {EMAIL_ADDRESS}
                </a>
              </p>
            </div>

            <div className="rounded-2xl border border-[#e7d9bd] bg-white p-6 text-center shadow-sm">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#fbeef0]">
                <PinIcon />
              </span>
              <h3 className="mt-4 font-serif text-lg text-[#6f1b1d]">Location</h3>
              <p className="mt-2 text-sm leading-6 text-[#5b4636]">{LOCATION}</p>
            </div>
          </div>

          <div className="mt-10 rounded-3xl border border-[#e7d9bd] bg-[#fdf6e7] px-6 py-8 text-center shadow-sm md:px-10 md:py-10">
            <p className="text-xs font-semibold uppercase tracking-[3px] text-[#8a6a55]">
              Stay Connected
            </p>
            <h2 className="mt-2 font-serif text-2xl text-[#2c1810] md:text-3xl">
              Follow us on social media
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#5b4636]">
              Stay connected with the latest collections and updates from Svarna Studio.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#1e5b2e] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-md transition hover:bg-[#164822]"
              >
                <WhatsAppIcon />
                Chat on WhatsApp
              </a>
              <a
                href={INSTAGRAM_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#a82a55] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-md transition hover:bg-[#8a2046]"
              >
                <InstagramIcon />
                Message on Instagram
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default ContactUsPage
