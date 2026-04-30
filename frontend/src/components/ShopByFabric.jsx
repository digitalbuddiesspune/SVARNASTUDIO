const fabricItems = [
  {
    name: 'LINEN',
    meta: 'Breathable and effortless for summer days',
    image:
      'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=700',
  },
  {
    name: 'COTTON',
    meta: 'Lightweight comfort for daily wear',
    image:
      'https://images.pexels.com/photos/29175924/pexels-photo-29175924.jpeg?auto=compress&cs=tinysrgb&w=700',
  },
  {
    name: 'SILK BLEND',
    meta: 'Subtle sheen with rich drape',
    image:
      'https://images.pexels.com/photos/29175928/pexels-photo-29175928.jpeg?auto=compress&cs=tinysrgb&w=700',
  },
  {
    name: 'CHIFFON',
    meta: 'Flowy silhouettes with delicate movement',
    image:
      'https://images.pexels.com/photos/2510089/pexels-photo-2510089.jpeg?auto=compress&cs=tinysrgb&w=700',
  },
]

function ShopByFabric() {
  return (
    <article className="py-8 md:py-10">
      <h2 className="text-center font-serif text-2xl uppercase tracking-wide text-[#7a2b2a] md:text-4xl">
        Shop by Fabric
      </h2>
      <div className="mx-auto mt-2 h-px w-44 bg-[#b77873]" />

      <div className="mt-8 grid gap-4 px-4 sm:grid-cols-2 md:px-8 lg:grid-cols-4">
        {fabricItems.map((item) => (
          <article
            key={item.name}
            className="mx-auto w-full max-w-[210px] rounded-[16px] border border-[#b87468] bg-[#fbf6ee] p-2 text-center md:max-w-[238px]"
          >
            <div className="overflow-hidden rounded-[12px] border border-[#e9ddd0] bg-white">
              <img
                src={item.image}
                alt={item.name}
                className="h-80 w-full object-cover md:h-[360px]"
                loading="lazy"
              />
            </div>
            <p className="mx-auto mt-2 h-px w-28 bg-[#d9b1aa]" />
            <p className="text-[#a63c44]">✽</p>
            <h3 className="font-serif text-3xl uppercase text-[#842b2c] md:text-2xl">{item.name}</h3>
            <p className="mx-auto mt-2 max-w-[200px] font-serif text-2xl leading-7 text-[#5f403d] md:text-base md:leading-6">
              {item.meta}
            </p>
            <p className="mt-2 text-[#b06f6f]">❦</p>
          </article>
        ))}
      </div>
    </article>
  )
}

export default ShopByFabric
