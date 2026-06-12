import cors from "cors";

const ALLOWED_ORIGINS = [
  "https://www.svarnastudio.in",
  "https://svarnastudio.in",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

export function createCorsMiddleware() {
  return cors({
    origin(origin, callback) {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  });
}
