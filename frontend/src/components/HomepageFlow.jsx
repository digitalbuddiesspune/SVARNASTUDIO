import ShopByCategory from './ShopByCategory'
import ShopByFabric from './ShopByFabric'
import ShopByOccasion from './ShopByOccasion'
import TrendingNow from './TrendingNow'
import NewArrivals from './NewArrivals'

function HomepageFlow() {
  return (
    <>
      <ShopByCategory />
      <section className="bg-[#f6ecdf] py-0">
        <NewArrivals />
        <div className="mt-0">
          <ShopByOccasion />
        </div>
        <div className="mt-0">
          <ShopByFabric />
        </div>
        <div className="mt-0 w-full">
          <TrendingNow />
        </div>
      </section>
    </>
  )
}

export default HomepageFlow
