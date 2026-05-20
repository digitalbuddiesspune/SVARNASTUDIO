/**
 * Backend API origin — set in `frontend/.env` as `VITE_API_BASE_URL` (no trailing slash).
 * Vite inlines `import.meta.env` at build time; do not hardcode URLs in feature code.
 */
const raw = import.meta.env.VITE_API_BASE_URL
if (typeof raw !== 'string' || !raw.trim()) {
  throw new Error(
    'VITE_API_BASE_URL is missing or empty. Add it to frontend/.env (see .env.example).'
  )
}

export const API_BASE_URL = raw.trim().replace(/\/$/, '')
