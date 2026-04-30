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
    <article className="relative overflow-hidden bg-[#f4ecdf] py-8 md:py-10">
      

      <h2 className="text-center font-serif text-3xl uppercase tracking-wide text-[#6f1b1d] md:text-5xl">
        Shop by Fabric
      </h2>
      <div className="mx-auto mt-2 flex w-fit items-center gap-3 text-[#8f1328]">
        <span className="h-px w-16 bg-[#8f1328]/70 md:w-24" />
        <span className="text-xl leading-none">❦</span>
        <span className="h-px w-16 bg-[#8f1328]/70 md:w-24" />
      </div>

      <div className="mx-auto mt-0 grid w-full max-w-[1180px] grid-cols-2 gap-3 px-3 md:gap-6 md:px-8 lg:grid-cols-4">
        {fabricItems.map((item) => (
          <article
            key={item.name}
            className="mx-auto w-full max-w-[168px] rounded-[16px] border border-[#a45858] bg-transparent p-2 text-center md:max-w-[220px]"
          >
            <div className="overflow-hidden rounded-[12px] border border-[#d8c4b1] bg-[#efe4d7] p-1">
              <img
                src={item.image}
                alt={item.name}
                className="h-[165px] w-full rounded-[10px] object-cover md:h-[250px]"
                loading="lazy"
              />
            </div>
            <div className="mx-auto mt-0 flex w-fit items-center gap-2 text-[#8f1328]">
              <span className="h-px w-9 bg-[#b98c8c]" />
              <span className="text-sm leading-none">✤</span>
              <span className="h-px w-9 bg-[#b98c8c]" />
            </div>
            <h3 className="mt-1 font-serif text-lg uppercase tracking-wide text-[#6f1b1d] md:text-[30px] md:leading-none">
              {item.name}
            </h3>
            <p className="mx-auto mt-2 max-w-[170px] font-serif text-[11px] italic leading-4 text-[#5f403d] md:max-w-[190px] md:text-[18px] md:leading-6">
              {item.meta}
            </p>
            <div className="mx-auto mt-3 flex w-fit items-center gap-2 text-[#8f1328]">
              <span className="h-px w-6 bg-[#b98c8c]" />
              <span className="text-[11px] leading-none">❦</span>
              <span className="h-px w-6 bg-[#b98c8c]" />
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 h-6 w-full bg-[#8f1328] bg-[radial-gradient(circle_at_center,_#d9b27c_0.6px,_transparent_0.8px)] [background-size:14px_14px] md:h-7" />
    </article>
  )
}

export default ShopByFabric
