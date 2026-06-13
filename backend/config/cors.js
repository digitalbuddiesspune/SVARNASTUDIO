import cors from "cors";

const PRODUCTION_ORIGINS = [
  "https://www.svarnastudio.in",
  "https://svarnastudio.in",
];

const LOCAL_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5177",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5177",
];

function isLocalDevOrigin(origin) {
  try {
    const { hostname, protocol } = new URL(origin);
    return (
      (protocol === "http:" || protocol === "https:") &&
      (hostname === "localhost" || hostname === "127.0.0.1")
    );
  } catch {
    return false;
  }
}

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (PRODUCTION_ORIGINS.includes(origin)) return true;
  if (LOCAL_ORIGINS.includes(origin)) return true;
  if (process.env.NODE_ENV !== "production" && isLocalDevOrigin(origin)) {
    return true;
  }
  return false;
}

export function createCorsMiddleware() {
  return cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }
      console.warn(`CORS blocked origin: ${origin}`);
      callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  });
}
