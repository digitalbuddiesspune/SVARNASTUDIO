import Navbar from './components/Navbar'
import AboutUsPage from './pages/AboutUsPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminPanelPage from './pages/AdminPanelPage'
import ContactUsPage from './pages/ContactUsPage'
import HomePage from './pages/HomePage'
import ProductDetailPage from './pages/ProductDetailPage'
import ProductsPage from './pages/ProductsPage'
import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'

function App() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname, location.search])

  return (
    <div className="min-h-screen bg-[#faf6f0] text-[#4d2018]">
      {!isAdminRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/contact" element={<ContactUsPage />} />
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route path="/admin/panel" element={<AdminPanelPage />} />
      </Routes>
    </div>
  )
}

export default App
