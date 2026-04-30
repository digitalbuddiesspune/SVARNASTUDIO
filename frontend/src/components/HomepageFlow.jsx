import ShopByCategory from './ShopByCategory'

const flowSections = [
  {
    title: 'Shop by Category',
    tone: 'from-[#f8eee6] to-[#f3dfd3]',
    items: [
      { name: 'Sarees', meta: 'Timeless drapes for every story' },
      { name: 'Kurta Sets', meta: 'Elegant pairings with modern ease' },
      { name: 'Co-ord Sets', meta: 'Effortless style for all-day wear' },
      { name: 'Indo-Western', meta: 'Tradition blended with a modern edge' },
    ],
  },
  {
    title: 'Shop by Occasion',
    tone: 'from-[#f8f3ec] to-[#efe5d8]',
    items: [
      { name: 'Wedding Festivities', meta: 'Rich weaves and statement silhouettes' },
      { name: 'Festive Gatherings', meta: 'Celebration-ready color palettes' },
      { name: 'Office Elegance', meta: 'Refined looks for professional settings' },
      { name: 'Everyday Classics', meta: 'Comfort-first pieces with graceful charm' },
    ],
  },
  {
    title: 'Shop by Fabric',
    tone: 'from-[#f7ede2] to-[#f2ddcf]',
    items: [
      { name: 'Linen', meta: 'Breathable and effortless for summer days' },
      { name: 'Cotton', meta: 'Lightweight comfort for daily wear' },
      { name: 'Silk Blend', meta: 'Subtle sheen with rich drape' },
      { name: 'Chiffon', meta: 'Flowy silhouettes with delicate movement' },
    ],
  },
  {
    title: 'Trending Now',
    tone: 'from-[#f9efe8] to-[#f1dbcd]',
    items: [
      { name: 'Pastel Bloom Edits', meta: 'Soft tones inspired by modern bridal looks' },
      { name: 'Floral Print Stories', meta: 'Fresh motifs for day-to-evening styling' },
      { name: 'Minimal Gold Accents', meta: 'Quiet luxury with handcrafted detailing' },
      { name: 'Signature Drapes', meta: 'Most-loved silhouettes this season' },
    ],
  },
  {
    title: 'New Arrivals',
    tone: 'from-[#f6eee7] to-[#ecd9cb]',
    items: [
      { name: 'Summer Linen Collection', meta: 'Cool textures in refined tones' },
      { name: 'Festive Collection', meta: 'Statement styles for upcoming celebrations' },
      { name: 'Office Wear Collection', meta: 'Sharp, graceful, and easy to style' },
      { name: 'Minimal Everyday Wear', meta: 'Clean lines for modern wardrobes' },
    ],
  },
]

function HomepageFlow() {
  const remainingSections = flowSections.filter(
    (section) => section.title !== 'Shop by Category'
  )

  return (
    <>
      <ShopByCategory />
      <section className="bg-[#faf7ec] py-14 md:py-16">
        <div className="mx-auto w-full max-w-7xl space-y-10 px-4 md:px-8">
          {remainingSections.map((section) => (
          <article
            key={section.title}
            className={`rounded-3xl bg-gradient-to-r ${section.tone} p-6 md:p-8`}
          >
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-serif text-3xl text-[#5f1f17] md:text-4xl">
                {section.title}
              </h2>
              <button
                type="button"
                className="rounded-full border border-[#8f0019] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#8f0019] transition hover:bg-[#8f0019] hover:text-white"
              >
                View All
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {section.items.map((item) => (
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
          ))}
        </div>
      </section>
    </>
  )
}

export default HomepageFlow
