import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./utils/auth.js";
import sliderRoutes from "./routes/slider.route.js";
import newsRoutes from "./routes/news.route.js";
import { galleryRoutes } from "./routes/gallery.route.js";
import contactRoutes from "./routes/contact.route.js";
import agentRoutes from "./routes/agentform.route.js";
import hajjahRoutes from './routes/hajjah.route.js';
const app = express();
// Allowed fixed origins
const allowedOrigins = [
    "https://travel-agance-hojj-umrah.vercel.app",
    "http://localhost:3000",
    "http://localhost:3001",
    process.env.FRONTEND_URL,
].filter(Boolean);
// CORS Config Function (সব Vercel Preview + Production Domain সাপোর্ট করার জন্য)
const corsConfig = cors({
    origin: (origin, callback) => {
        // 1. Postman/Server-to-Server request (origin না থাকলে)
        // 2. Allowed list-এ থাকলে
        // 3. Vercel-এর যেকোনো dynamic deployment URL (.vercel.app) হলে allow করবে
        if (!origin ||
            allowedOrigins.includes(origin) ||
            origin.endsWith(".vercel.app")) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
    ],
});
// Apply CORS & Handle Preflight Requests
app.use(corsConfig);
app.options("/*path", corsConfig);
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(morgan("dev"));
// Auth route — named wildcard (Express 5 / path-to-regexp এর জন্য)
app.all("/api/auth/*path", toNodeHandler(auth));
// JSON parser (auth এর পরে)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "public/uploads")));
// Other routes
app.use("/api/sliders", sliderRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/hajjah", hajjahRoutes);
export default app;
//# sourceMappingURL=app.js.map