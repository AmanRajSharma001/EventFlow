import express from "express";
import cors from "cors";
import config from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import { notFoundHandler, errorHandler } from "./middleware/error.middleware.js";

const app = express();

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (such as mobile apps, curl, or Postman)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      config.corsOrigin,
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:3000"
    ];

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(null, true); // Permissive in development
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EventFlow API is running",
    environment: config.nodeEnv,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

app.use("/api/auth", authRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
