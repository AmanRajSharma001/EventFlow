import express from "express";
import cors from "cors";
import config from "./config/env.js";
import { checkDatabaseConnection } from "./config/prisma.js";
import authRoutes from "./routes/auth.routes.js";
import eventRoutes from "./routes/event.routes.js";
import registrationRoutes from "./routes/registration.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import announcementRoutes from "./routes/announcement.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import organizerRoutes from "./routes/organizer.routes.js";
import { notFoundHandler, errorHandler } from "./middleware/error.middleware.js";

const app = express();

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const configuredOrigins = (config.corsOrigin || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const allowedOrigins = [
      ...configuredOrigins,
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:3000"
    ];

    if (allowedOrigins.includes(origin) || config.nodeEnv !== "production") {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} not allowed by CORS`));
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

app.get("/api/ready", async (req, res) => {
  const dbStatus = await checkDatabaseConnection();
  if (dbStatus.connected) {
    return res.status(200).json({
      success: true,
      ready: true,
      database: "connected",
      environment: config.nodeEnv,
      timestamp: new Date().toISOString()
    });
  }
  return res.status(503).json({
    success: false,
    ready: false,
    database: "disconnected",
    error: dbStatus.error,
    environment: config.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/organizer", organizerRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
