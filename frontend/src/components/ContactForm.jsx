import { useState } from 'react'

const INITIAL_FORM = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
}

function ContactForm({
  title = 'Get in Touch',
  subtitle = 'Send us a message',
  description = 'Fill in the form below and our team will get back to you as soon as possible.',
}) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [status, setStatus] = useState({ state: 'idle', message: '' })

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus({
        state: 'error',
        message: 'Please fill in your name, email and message.',
      })
      return
    }

    const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY

    if (!accessKey) {
      setStatus({
        state: 'error',
        message:
          'Contact form is not configured yet. Please try again later or reach us directly.',
      })
      return
    }

    setStatus({ state: 'loading', message: 'Sending your message...' })

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: accessKey,
          name: form.name,
          email: form.email,
          phone: form.phone,
          subject: form.subject || 'New enquiry from Svarna Studio',
          message: form.message,
          from_name: 'Svarna Studio Contact Form',
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setStatus({
          state: 'success',
          message:
            'Thank you! Your message has been received. We will get back to you soon.',
        })
        setForm(INITIAL_FORM)
      } else {
        setStatus({
          state: 'error',
          message:
            result.message || 'Something went wrong. Please try again.',
        })
      }
    } catch (submitError) {
      setStatus({
        state: 'error',
        message:
          'Network error. Please check your connection and try again.',
      })
    }
  }

  const isSubmitting = status.state === 'loading'

  return (
    <section className="bg-[#faf6ee] py-12 md:py-16">
      <div className="mx-auto w-full max-w-3xl px-4 md:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[3px] text-[#8a6a55]">
            {subtitle}
          </p>
          <h2 className="mt-2 font-serif text-3xl text-[#2c1810] md:text-4xl">
            {title}
          </h2>
          <div className="mx-auto mt-3 flex w-fit items-center gap-3 text-[#8f1328]">
            <span className="h-px w-12 bg-[#8f1328]/70 md:w-20" />
            <span className="text-base leading-none">❦</span>
            <span className="h-px w-12 bg-[#8f1328]/70 md:w-20" />
          </div>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#5b4636]">
            {description}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-3xl border border-[#e7d9bd] bg-white p-6 shadow-sm md:p-8"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-left">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5b4636]">
                Name <span className="text-[#8f0019]">*</span>
              </span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="mt-1 w-full rounded-xl border border-[#e7d9bd] bg-[#fbf6ee] px-3 py-2.5 text-sm text-[#3d2418] outline-none transition focus:border-[#8f0019] focus:bg-white focus:ring-2 focus:ring-[#8f0019]/15"
              />
            </label>

            <label className="block text-left">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5b4636]">
                Email <span className="text-[#8f0019]">*</span>
              </span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="mt-1 w-full rounded-xl border border-[#e7d9bd] bg-[#fbf6ee] px-3 py-2.5 text-sm text-[#3d2418] outline-none transition focus:border-[#8f0019] focus:bg-white focus:ring-2 focus:ring-[#8f0019]/15"
              />
            </label>

            <label className="block text-left">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5b4636]">
                Phone
              </span>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 90000 00000"
                className="mt-1 w-full rounded-xl border border-[#e7d9bd] bg-[#fbf6ee] px-3 py-2.5 text-sm text-[#3d2418] outline-none transition focus:border-[#8f0019] focus:bg-white focus:ring-2 focus:ring-[#8f0019]/15"
              />
            </label>

            <label className="block text-left">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5b4636]">
                Subject
              </span>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="What is this regarding?"
                className="mt-1 w-full rounded-xl border border-[#e7d9bd] bg-[#fbf6ee] px-3 py-2.5 text-sm text-[#3d2418] outline-none transition focus:border-[#8f0019] focus:bg-white focus:ring-2 focus:ring-[#8f0019]/15"
              />
            </label>
          </div>

          <label className="mt-4 block text-left">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5b4636]">
              Message <span className="text-[#8f0019]">*</span>
            </span>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={5}
              placeholder="Write your message here..."
              className="mt-1 w-full resize-y rounded-xl border border-[#e7d9bd] bg-[#fbf6ee] px-3 py-2.5 text-sm text-[#3d2418] outline-none transition focus:border-[#8f0019] focus:bg-white focus:ring-2 focus:ring-[#8f0019]/15"
            />
          </label>

          {status.state === 'error' && (
            <p className="mt-4 rounded-lg bg-[#fde9ec] px-4 py-2.5 text-sm text-[#b42318]">
              {status.message}
            </p>
          )}
          {status.state === 'success' && (
            <p className="mt-4 rounded-lg bg-[#e7f6ea] px-4 py-2.5 text-sm text-[#1e5b2e]">
              {status.message}
            </p>
          )}

          <div className="mt-6 flex flex-col items-center justify-between gap-3 md:flex-row">
            <p className="text-xs text-[#7a5b4f]">
              We respect your privacy. Your info stays with us.
            </p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-full bg-[#8f0019] px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-md transition hover:bg-[#730014] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

export default ContactForm
