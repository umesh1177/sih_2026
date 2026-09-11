import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import apiRoutes from "./routes/api.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    portal: "CAPACITY CONNECT - MoES / IMD Learning Management Portal",
    timestamp: new Date().toISOString()
  });
});

// Mount API Routes
app.use("/api", apiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ success: false, message: err.message || "Internal Server Error" });
});

// Server initialization - Capacity Connect Portal
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 CAPACITY CONNECT MoES/IMD LMS Server running on http://localhost:${PORT}`);
  console.log(`🏛️ Problem Statement ID: 26075 | Theme: Smart Education`);
  console.log(`=======================================================`);
});

