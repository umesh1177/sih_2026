import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRoutes from "./routes/api.js";

dotenv.config();

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
    version: "2.1.0",
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

