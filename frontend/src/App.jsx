import FeaturedCollections from './components/FeaturedCollections'
import Footer from './components/Footer'
import HeroSection from './components/HeroSection'
import Navbar from './components/Navbar'
import OfferStrip from './components/OfferStrip'
import ShopByCategory from './components/ShopByCategory'

function App() {
  return (
    <div className="min-h-screen bg-[#faf6f0] text-[#4d2018]">
      <Navbar />
      <HeroSection />
      <OfferStrip />
      <ShopByCategory />
      <FeaturedCollections />
      <Footer />
    </div>
  )
}

export default App
