
import express, { ErrorRequestHandler } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

import { toNodeHandler } from "better-auth/node";
import { auth } from "./utils/auth.js";
import { allowedOrigins } from "./utils/origins.js";

import sliderRoutes from "./routes/slider.route.js";
import newsRoutes from "./routes/news.route.js";
import { galleryRoutes } from "./routes/gallery.route.js";
import contactRoutes from "./routes/contact.route.js";
import agentRoutes from "./routes/agentform.route.js";
import hajjahRoutes from "./routes/hajjah.route.js";
import paymentRoutes from "./routes/Payment.route.js";

const app = express();

const corsConfig = cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(
      new Error(`Not allowed by CORS: ${origin}`)
    );
  },

  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
});

app.use(corsConfig);
app.options(/.*/, corsConfig);

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "travel-agence-server",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// Better Auth
app.all("/api/auth/*path", toNodeHandler(auth));

// Request parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Local uploaded files
app.use(
  "/uploads",
  express.static(
    path.join(process.cwd(), "public/uploads")
  )
);

// API routes
app.use("/api/sliders", sliderRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/hajjah", hajjahRoutes);
app.use("/api/payments", paymentRoutes);

const errorHandler: ErrorRequestHandler = (
  err,
  _req,
  res,
  _next
) => {
  console.error("Unhandled error:", err);

  if (err?.code === "LIMIT_FILE_SIZE") {
    res.status(400).json({
      error: "Image size cannot exceed 2MB",
    });
    return;
  }

  const status =
    typeof err?.status === "number" ? err.status : 500;

  res.status(status).json({
    error: err?.message || "Server error",
  });
};

app.use(errorHandler);

export default app;
