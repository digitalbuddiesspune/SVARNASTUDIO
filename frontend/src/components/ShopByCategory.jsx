import { Link } from 'react-router-dom'

const categories = [
  {
    title: 'Sarees',
    image:
      'https://res.cloudinary.com/dkq4kvwrr/image/upload/v1777536140/43f92fce-17f1-4cf6-969a-a571ab64c611.png',
    offsetClass: 'md:mt-0',
  },
  {
    title: 'Kurta Sets',
    image:
      'https://res.cloudinary.com/dkq4kvwrr/image/upload/v1777536297/132fc2de-6bbe-44e9-b561-1dbade8d62a1.png',
    offsetClass: 'md:mt-10',
  },
  {
    title: 'Co-ord Sets',
    image:
      'https://res.cloudinary.com/dkq4kvwrr/image/upload/v1777536442/5363fb0f-2ddd-432f-af7f-2e670b4de81f.png',
    offsetClass: 'md:mt-0',
  },
  {
    title: 'Tops',
    image:
      'https://res.cloudinary.com/dkq4kvwrr/image/upload/q_auto/f_auto/v1777536616/c1ee00bb-5be0-4741-8d31-79e01792111d.png',
    offsetClass: 'md:mt-10',
  },
  {
    title: 'Indo-Western',
    image:
      'https://res.cloudinary.com/dkq4kvwrr/image/upload/q_auto/f_auto/v1777536730/c686982d-7968-4518-98ec-62877ed4cc08.png',
    offsetClass: 'md:mt-0',
  },
]

function ShopByCategory() {
  return (
    <section className="bg-[#f8f4ea] py-10 md:py-16">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <h2 className="text-center font-serif text-3xl uppercase tracking-wide text-[#7b2d2a] md:text-5xl">
          Shop By Category
        </h2>
        <div className="mx-auto mt-2 flex w-fit items-center gap-2 text-[#b69478]">
          <span className="h-px w-10 bg-[#b69478]" />
          <span className="text-xs leading-none">❦</span>
          <span className="h-px w-10 bg-[#b69478]" />
        </div>
      </div>
      <div className="mx-auto mt-6 grid w-full max-w-7xl grid-cols-2 gap-3 px-4 sm:grid-cols-2 md:mt-8 md:gap-5 lg:grid-cols-5 md:px-8">
        {categories.map((category, index) => (
          <article
            key={category.title}
            className={`${category.offsetClass} ${
              index === categories.length - 1 ? 'col-span-2 justify-self-center sm:col-span-1' : ''
            }`}
          >
            <Link
              to={`/products?${new URLSearchParams({ category: category.title }).toString()}`}
              className="group block"
            >
              <div className="overflow-hidden rounded-[18px] border-2 border-[#6b2a26] bg-[#f8f4ea] p-2 transition-transform duration-200 group-hover:-translate-y-1">
                <div className="overflow-hidden rounded-[14px] border border-white bg-white">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="h-48 w-full object-cover md:h-72"
                    loading="lazy"
                  />
                </div>
              </div>
              <h3 className="mt-1 text-center font-serif text-xs tracking-wide text-[#7b2d2a] md:mt-2 md:text-base">
                {category.title}
              </h3>
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}

export default ShopByCategory
