import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import apiRoutes from "./routes/api.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// ─── 1. Security Headers with Helmet ───
app.use(helmet({
  contentSecurityPolicy: false, // Allows flexible media embed for course previews
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// ─── 2. CORS Configuration ───
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173")
  .split(",")
  .map(s => s.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
      return callback(null, true);
    }
    return callback(new Error(`CORS Policy: Origin ${origin} not permitted.`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── 3. Rate Limiting for Sensitive Auth Endpoints ───
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 login/register requests per window
  message: {
    success: false,
    message: "Too many authentication attempts from this IP. Please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// ─── 4. Health Check ───
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    portal: "CAPACITY CONNECT - MoES / IMD Learning Management Portal",
    environment: NODE_ENV,
    version: "2.0.0-SIH26075",
    timestamp: new Date().toISOString()
  });
});

// ─── 5. Mount API Routes ───
app.use("/api", apiRoutes);

// ─── 6. 404 Handler ───
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` });
});

// ─── 7. Centralized Safe Error Handling Middleware ───
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  const isProd = NODE_ENV === "production";
  res.status(err.status || 500).json({
    success: false,
    message: isProd ? "An internal server error occurred. Please contact portal administration." : (err.message || "Internal Server Error")
  });
});

// ─── 8. Server Initialization ───
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 CAPACITY CONNECT MoES/IMD LMS Server running on http://localhost:${PORT}`);
  console.log(`🏛️ Problem Statement ID: 26075 | Theme: Smart Education`);
  console.log(`🔒 Security: Helmet, Express Rate Limit, Role-Based Access Control, IDOR Safe`);
  console.log(`=======================================================`);
});
