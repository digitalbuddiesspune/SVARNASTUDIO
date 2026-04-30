import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ADMIN_EMAIL = 'admin@gmail.com'
const ADMIN_PASSWORD = 'admin123'
const ADMIN_STORAGE_KEY = 'svarna_admin_auth'

function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (localStorage.getItem(ADMIN_STORAGE_KEY) === 'true') {
      navigate('/admin/panel')
    }
  }, [navigate])

  const handleSubmit = (event) => {
    event.preventDefault()

    if (email.trim() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_STORAGE_KEY, 'true')
      navigate('/admin/panel')
      return
    }

    setError('Invalid admin credentials')
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#faf7ec] px-4 py-10">
      <section className="mx-auto w-full max-w-md rounded-2xl border border-[#eadbcb] bg-white p-6 shadow-sm md:p-8">
        <h1 className="font-serif text-3xl text-[#5f1f17]">Admin Login</h1>
        <p className="mt-2 text-sm text-[#7a5b4f]">Use your admin email and password.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-[#5f1f17]">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-lg border border-[#ddc9b5] px-3 py-2 outline-none ring-[#8f0019]/30 focus:ring"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[#5f1f17]">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-lg border border-[#ddc9b5] px-3 py-2 outline-none ring-[#8f0019]/30 focus:ring"
              required
            />
          </label>

          {error && <p className="text-sm text-[#b42318]">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-[#8f0019] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6f0013]"
          >
            Login
          </button>
        </form>
      </section>
    </main>
  )
}

export default AdminLoginPage
