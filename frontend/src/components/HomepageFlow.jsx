import ShopByCategory from './ShopByCategory'
import ShopByFabric from './ShopByFabric'
import ShopByOccasion from './ShopByOccasion'
import TrendingNow from './TrendingNow'
import NewArrivals from './NewArrivals'

function HomepageFlow() {
  return (
    <>
      <ShopByCategory />
      <section className="bg-[#faf7ec] py-14 md:py-16">
        <NewArrivals />
        <div className="mt-10">
          <ShopByOccasion />
        </div>
        <div className="mx-auto mt-10 w-full max-w-7xl space-y-10 px-4 md:px-8">
          <ShopByFabric />
          <TrendingNow />
        </div>
      </section>
    </>
  )
}

export default HomepageFlow
