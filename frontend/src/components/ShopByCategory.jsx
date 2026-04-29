const categories = [
  {
    title: 'Wedding Collection',
    description: 'Rich zari borders and festive shades for grand celebrations.',
  },
  {
    title: 'Daily Elegance',
    description: 'Lightweight comfort sarees designed for everyday beauty.',
  },
  {
    title: 'Party Picks',
    description: 'Statement drapes with modern motifs for special evenings.',
  },
]

function ShopByCategory() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-14 md:px-8">
      <h2 className="text-center font-serif text-3xl text-[#6f1c15] md:text-4xl">
        Shop By Category
      </h2>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {categories.map((category) => (
          <article
            key={category.title}
            className="rounded-2xl border border-[#edddd0] bg-white p-6 shadow-sm"
          >
            <h3 className="font-serif text-2xl text-[#7d241b]">{category.title}</h3>
            <p className="mt-3 text-sm leading-6 text-[#7f5c50]">
              {category.description}
            </p>
            <button
              type="button"
              className="mt-5 rounded-full border border-[#8f0019] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#8f0019] transition hover:bg-[#8f0019] hover:text-white"
            >
              Explore
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}

export default ShopByCategory
