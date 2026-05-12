import { Link } from 'react-router-dom'
import Footer from '../components/Footer'

function AboutUsPage() {
  return (
    <>
      <main className="bg-[#faf6ee] text-[#3d2418]">
        <section className="relative overflow-hidden bg-[#f7ecd9]">
          <div className="mx-auto w-full max-w-5xl px-4 pb-10 pt-14 text-center md:px-8 md:pb-14 md:pt-20">
            <p className="text-xs font-semibold uppercase tracking-[4px] text-[#8a6a55]">
              Our Story
            </p>
            <h1 className="mt-3 font-serif text-4xl leading-tight text-[#2c1810] md:text-6xl">
              About Us
            </h1>
            <div className="mx-auto mt-4 flex w-fit items-center gap-3 text-[#8f1328]">
              <span className="h-px w-16 bg-[#8f1328]/70 md:w-24" />
              <span className="text-lg leading-none">❦</span>
              <span className="h-px w-16 bg-[#8f1328]/70 md:w-24" />
            </div>
            <p className="mx-auto mt-6 max-w-2xl font-serif text-base italic text-[#7a5b4f] md:text-lg">
              Welcome to Svarna Studio — where fashion feels elegant, modern, and special.
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-4xl px-4 pb-16 pt-10 md:px-8 md:pb-20 md:pt-14">
          <div className="space-y-6 text-[15px] leading-8 text-[#4d3a30] md:text-[17px] md:leading-9">
            <p>
              Welcome to <span className="font-semibold text-[#6f1b1d]">Svarna Studio</span>
              {' '}— a place where fashion feels elegant, modern, and special. We bring
              together styles that blend timeless beauty with today&apos;s trends, designed
              for every occasion and every mood.
            </p>
            <p>
              From everyday outfits to festive collections, we believe what you wear should
              make you feel confident, comfortable, and effortlessly beautiful. Our focus is
              on quality, thoughtful details, and styles that you truly enjoy wearing.
            </p>
            <p>
              At Svarna Studio, fashion is more than just clothing — it&apos;s about
              expressing yourself with confidence and grace. We are passionate about creating
              a shopping experience that feels simple, warm, and memorable for every
              customer.
            </p>
          </div>

          <div className="mt-10 rounded-3xl border border-[#e7d9bd] bg-[#fdf6e7] px-6 py-8 text-center shadow-sm md:px-10 md:py-10">
            <p className="font-serif text-2xl italic text-[#6f1b1d] md:text-3xl">
              Made with style, chosen with love.
            </p>
            <span className="mt-3 inline-block text-2xl text-[#c4a261]" aria-hidden="true">
              ✦
            </span>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              {
                title: 'Quality First',
                desc: 'Thoughtfully sourced fabrics and refined detailing in every piece.',
              },
              {
                title: 'Timeless Style',
                desc: 'Designs that balance modern trends with classic elegance.',
              },
              {
                title: 'Crafted with Care',
                desc: 'A warm, personal shopping experience built around you.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-[#ead7be] bg-white p-5 text-center shadow-sm"
              >
                <h3 className="font-serif text-lg text-[#6f1b1d]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#5b4636]">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-[#5b4636]">
              Have a question or want to know more? We&apos;re here to help.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-[#8f0019] px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-md transition hover:bg-[#730014]"
            >
              Contact Us
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default AboutUsPage
