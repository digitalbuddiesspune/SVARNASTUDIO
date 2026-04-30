function CategoryInfoSection({ title, tone, items }) {
  return (
    <article className={`rounded-3xl bg-gradient-to-r ${tone} p-6 md:p-8`}>
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-serif text-3xl text-[#5f1f17] md:text-4xl">{title}</h2>
        <button
          type="button"
          className="rounded-full border border-[#8f0019] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#8f0019] transition hover:bg-[#8f0019] hover:text-white"
        >
          View All
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.name}
            className="rounded-2xl border border-white/60 bg-white/75 p-4 shadow-sm backdrop-blur-sm"
          >
            <h3 className="font-serif text-xl text-[#7a251b]">{item.name}</h3>
            <p className="mt-2 text-sm leading-6 text-[#6f4d42]">{item.meta}</p>
          </div>
        ))}
      </div>
    </article>
  )
}

export default CategoryInfoSection
