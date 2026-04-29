const featured = [
  { name: 'Banarasi Heritage', tag: 'Best Seller' },
  { name: 'Pastel Bloom', tag: 'New Arrival' },
  { name: 'Regal Kanjivaram', tag: 'Premium' },
]

function FeaturedCollections() {
  return (
    <section className="bg-[#fff9f5] py-14">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <h2 className="text-center font-serif text-3xl text-[#6f1c15] md:text-4xl">
          Featured Collections
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {featured.map((item) => (
            <article
              key={item.name}
              className="rounded-2xl bg-gradient-to-br from-[#f6e3d8] to-[#f3d0be] p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-[#8f0019]">
                {item.tag}
              </p>
              <h3 className="mt-3 font-serif text-2xl text-[#6f1c15]">{item.name}</h3>
              <p className="mt-3 text-sm text-[#6f4b40]">
                A curated selection inspired by traditional craft and contemporary
                drape stories.
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturedCollections
