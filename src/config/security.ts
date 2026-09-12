import express, { type Express } from "express";
import cors, { type CorsOptions } from "cors";
import helmet from "helmet";
import hpp from "hpp";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";

// Comma-separated list in .env, e.g. CORS_ORIGIN=http://localhost:3000,https://shop.com
// "*" allows any origin, but then credentials must stay off — browsers reject that pair.
const allowedOrigins = (process.env.CORS_ORIGIN ?? "*").split(",").map((origin) => origin.trim());
const allowAnyOrigin = allowedOrigins.includes("*");

const corsOptions: CorsOptions = {
  origin: allowAnyOrigin ? "*" : allowedOrigins,
  credentials: !allowAnyOrigin,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
};

// Max 100 requests per IP per hour, applied only to the API routes.
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 2000,
  limit: 11100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many requests from this IP. Please try again in an hour.",
  },
});

// Query params that are allowed to appear more than once (?sort=a&sort=b).
const hppWhitelist = ["sort", "fields", "page", "limit", "price", "rating"];

const applySecurity = (app: Express): void => {
  // 1. Cross-origin access for the browser clients we trust.
  app.use(cors(corsOptions));

  // 2. Secure HTTP headers (hides X-Powered-By, sets XSS/CSP defaults, etc.)
  app.use(helmet());

  // 3. Body parsers with a 10kb cap, so huge payloads can't exhaust memory.
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true, limit: "10kb" }));

  // 4. Strip "$" and "." keys from body/query/params (NoSQL injection).
  app.use(mongoSanitize());

  // 5. Collapse duplicate query params to a single value (parameter pollution).
  app.use(hpp({ whitelist: hppWhitelist }));

  // 6. Rate limit the API surface only.
  app.use("/api", apiLimiter);
};

export default applySecurity;
