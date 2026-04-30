const occasionItems = [
  {
    name: 'WEDDING',
    icon: 'wedding',
    image:
      'https://res.cloudinary.com/dkq4kvwrr/image/upload/q_auto/f_auto/v1777548349/ChatGPT_Image_Apr_30_2026_04_54_41_PM_1_1_vc1g9b.png',
  },
  {
    name: 'FESTIVE',
    icon: 'festive',
    image:
      'https://res.cloudinary.com/dkq4kvwrr/image/upload/q_auto/f_auto/v1777548609/ChatGPT_Image_Apr_30_2026_04_59_09_PM_1_1_cgi3a6.png',
  },
  {
    name: 'PARTY WEAR',
    icon: 'party',
    image:
      'https://res.cloudinary.com/dkq4kvwrr/image/upload/q_auto/f_auto/v1777548864/ChatGPT_Image_Apr_30_2026_05_03_48_PM_1_nwqm7e.png',
  },
  {
    name: 'DAY OUT',
    icon: 'day',
    image:
      'https://res.cloudinary.com/dkq4kvwrr/image/upload/q_auto/f_auto/v1777549023/ChatGPT_Image_Apr_30_2026_05_06_17_PM_1_dlw5xd.png',
  },
  {
    name: 'WORK WEAR',
    icon: 'work',
    image:
      'https://res.cloudinary.com/dkq4kvwrr/image/upload/q_auto/f_auto/v1777549172/ChatGPT_Image_Apr_30_2026_05_09_00_PM_1_rb3oyb.png',
  },
]

const occasionIconMap = {
  wedding: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-10 w-10 text-[#e3c28d]">
      <path
        d="M7 16.2a4.2 4.2 0 1 1 2.9-7.3l2.1 2 2.1-2a4.2 4.2 0 1 1 .1 6l-2.2-2-2.1 2a4.1 4.1 0 0 1-2.9 1.3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  festive: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-10 w-10 text-[#e3c28d]">
      <path
        d="M8 16h8c-1.4-1.3-2.2-2.3-2.2-3.8 0-1.2.6-2.3 1.8-3-2 .2-3.4 1.3-3.6 2.8-.2-1.5-1.6-2.6-3.6-2.8 1.2.7 1.8 1.8 1.8 3 0 1.5-.8 2.5-2.2 3.8ZM9.7 16h4.6l.8 1.8H8.9l.8-1.8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  party: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-10 w-10 text-[#e3c28d]">
      <path
        d="M6 5h12M8.2 5l3.8 5.3L15.8 5M12 10.3V17m-3 0h6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  day: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-10 w-10 text-[#e3c28d]">
      <circle cx="12" cy="12" r="3.4" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M12 4.5V2.8M12 21.2v-1.7M6.8 6.8 5.6 5.6M18.4 18.4l-1.2-1.2M4.5 12H2.8M21.2 12h-1.7M6.8 17.2l-1.2 1.2M18.4 5.6l-1.2 1.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  ),
  work: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-10 w-10 text-[#e3c28d]">
      <path
        d="M3.8 8.8h16.4v9.4H3.8zM8.5 8.8v-1a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
}

const ornamentLine = (
  <svg viewBox="0 0 140 16" aria-hidden="true" className="h-3.5 w-20 text-[#dcb987]">
    <path d="M2 8h44M94 8h44" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path
      d="M70 11c-2.5 0-5-1.4-6.5-3 1.5-1.7 4-3 6.5-3 2.5 0 5 1.3 6.5 3-1.5 1.6-4 3-6.5 3Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M63.5 8h13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
)

function ShopByOccasion() {
  return (
    <article className="relative overflow-hidden bg-[#f6ecdc] py-8 md:py-10">
      <div className="pointer-events-none absolute left-0 top-0 h-16 w-16 rounded-br-[58px] border-b-[10px] border-r-[10px] border-[#8f1328] md:h-24 md:w-24 md:rounded-br-[78px]" />
      <div className="pointer-events-none absolute right-0 top-0 h-16 w-16 rounded-bl-[58px] border-b-[10px] border-l-[10px] border-[#8f1328] md:h-24 md:w-24 md:rounded-bl-[78px]" />

      <h2 className="text-center font-serif text-3xl uppercase tracking-wide text-[#6f1b1d] md:text-[52px] pt-10">
        Shop by Occasion
      </h2>
      <div className="mx-auto mt-2 flex w-fit items-center gap-3 text-[#8f1328]">
        <span className="h-px w-16 bg-[#8f1328]/70 md:w-28" />
        <span className="text-xl leading-none">❦</span>
        <span className="h-px w-16 bg-[#8f1328]/70 md:w-28" />
      </div>

      <div className="mx-auto mt-8 grid w-full max-w-[1180px] grid-cols-2 gap-3 px-3 sm:grid-cols-3 md:gap-5 md:px-6 lg:grid-cols-5">
        {occasionItems.map((item, index) => (
          <article
            key={item.name}
            className={`mx-auto w-full max-w-[170px] overflow-hidden rounded-[12px] sm:max-w-[198px] ${
              index === occasionItems.length - 1 ? 'col-span-2 justify-self-center sm:col-span-1' : ''
            }`}
          >
            <div
              className="bg-[#d2a06f] p-[2px]"
              style={{
                clipPath:
                  'polygon(0% 100%, 0% 20%, 6% 15%, 13% 14%, 18% 8%, 25% 6%, 35% 7%, 44% 3%, 50% 0%, 56% 3%, 65% 7%, 75% 6%, 82% 8%, 87% 14%, 94% 15%, 100% 20%, 100% 100%)',
              }}
            >
              <div
                className="overflow-hidden"
                style={{
                  clipPath:
                    'polygon(0% 100%, 0% 20%, 6% 15%, 13% 14%, 18% 8%, 25% 6%, 35% 7%, 44% 3%, 50% 0%, 56% 3%, 65% 7%, 75% 6%, 82% 8%, 87% 14%, 94% 15%, 100% 20%, 100% 100%)',
                }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-[230px] w-full object-cover sm:h-[290px]"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="border-t border-[#bf8f5e] bg-[#861229] px-2 pb-3 pt-3 text-center text-[#f2d7b8] sm:pb-4 sm:pt-4">
              <div className="flex justify-center">{occasionIconMap[item.icon]}</div>
              <h3 className="mt-2 font-serif text-[12px] uppercase tracking-[1.3px] text-[#f0ddc2] sm:text-[14px]">
                {item.name}
              </h3>
              <div className="mt-1.5 flex justify-center">{ornamentLine}</div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 h-6 w-full bg-[#8f1328] bg-[radial-gradient(circle_at_center,_#d9b27c_0.6px,_transparent_0.8px)] [background-size:14px_14px] md:h-7" />
    </article>
  )
}

export default ShopByOccasion
