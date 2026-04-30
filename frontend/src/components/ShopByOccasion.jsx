const occasionItems = [
  {
    name: 'WEDDING',
    icon: '❁',
    image:
      'https://images.pexels.com/photos/27055096/pexels-photo-27055096.jpeg?auto=compress&cs=tinysrgb&w=700',
  },
  {
    name: 'FESTIVE',
    icon: '🪔',
    image:
      'https://images.pexels.com/photos/29175928/pexels-photo-29175928.jpeg?auto=compress&cs=tinysrgb&w=700',
  },
  {
    name: 'PARTY WEAR',
    icon: '🍸',
    image:
      'https://images.pexels.com/photos/11389427/pexels-photo-11389427.jpeg?auto=compress&cs=tinysrgb&w=700',
  },
  {
    name: 'DAY OUT',
    icon: '☼',
    image:
      'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=700',
  },
  {
    name: 'WORK WEAR',
    icon: '▭',
    image:
      'https://images.pexels.com/photos/6626903/pexels-photo-6626903.jpeg?auto=compress&cs=tinysrgb&w=700',
  },
]

function ShopByOccasion() {
  return (
    <article
      className="relative overflow-hidden bg-center bg-no-repeat py-8 md:py-10"
      style={{
        backgroundImage:
          "url('https://res.cloudinary.com/dkq4kvwrr/image/upload/q_auto/f_auto/v1777546379/ChatGPT_Image_Apr_30_2026_04_22_02_PM_1_opdvio.png')",
        backgroundSize: '100% 100%',
      }}
    >

      <h2 className="text-center font-serif text-2xl uppercase tracking-wide text-[#7a2a2a] md:text-5xl">
        Shop by Occasion
      </h2>
      <div className="mx-auto mt-2 h-1 w-28 rounded-full bg-[#7a2a2a]/70" />

      <div className="mt-8 grid grid-cols-2 gap-3 px-2 sm:grid-cols-3 md:px-4 lg:grid-cols-5">
        {occasionItems.map((item) => (
          <article
            key={item.name}
            className="mx-auto w-full max-w-[130px] overflow-hidden rounded-[9px] border border-[#d2af89] bg-[#f8efe1] shadow-[0_2px_8px_rgba(79,13,24,0.2)] sm:max-w-[188px]"
          >
            <div
              className="overflow-hidden bg-[#d4a66f]"
              style={{
                clipPath:
                  'polygon(0% 100%, 0% 15%, 6% 8%, 14% 4%, 24% 8%, 34% 2%, 44% 8%, 50% 0%, 56% 8%, 66% 2%, 76% 8%, 86% 4%, 94% 8%, 100% 15%, 100% 100%)',
              }}
            >
              <img
                src={item.image}
                alt={item.name}
                className="h-52 w-full object-cover sm:h-[238px]"
                loading="lazy"
              />
            </div>
            <div className="bg-gradient-to-b from-[#981f35] to-[#7c1021] px-2 py-3 text-center text-[#f2d7b8] sm:py-4">
              <p className="text-[19px] leading-none sm:text-[22px]">{item.icon}</p>
              <h3 className="mt-1 font-serif text-[13px] uppercase tracking-wide sm:text-lg">
                {item.name}
              </h3>
              <p className="mt-1 text-[10px] leading-none tracking-widest">❦</p>
            </div>
          </article>
        ))}
      </div>
    </article>
  )
}

export default ShopByOccasion
