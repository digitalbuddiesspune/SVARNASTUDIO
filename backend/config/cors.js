import cors from "cors";

const DEFAULT_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "https://www.svarnastudio.in",
  "https://svarnastudio.in",
];

function parseAllowedOrigins() {
  const fromEnv = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return [...new Set([...DEFAULT_ORIGINS, ...fromEnv])];
}

export function createCorsMiddleware() {
  const allowedOrigins = parseAllowedOrigins();

  return cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
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

export { parseAllowedOrigins };
