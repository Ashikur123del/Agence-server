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
import hajjahRoutes from "./routes/hajjah.route.js";
import { allowedOrigins } from "./utils/origins.js";
const app = express();
// CORS: shudhu apnar frontend (env: FRONTEND_URL) ar localhost.
// Ager moto "*.vercel.app" shobai ke allow kora hoyni, karon credentials shoho
// jekono vercel.app site theke request pathano jeto.
const corsConfig = cors({
    origin: (origin, callback) => {
        // Origin na thakle (Postman / server-to-server) allow
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error(`Not allowed by CORS: ${origin}`));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
});
app.use(corsConfig);
app.options("/*path", corsConfig);
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(morgan("dev"));
// Health check (deploy thik hoyeche kina dekhar jonno)
app.get("/", (_req, res) => {
    res.json({ ok: true, service: "travel-agence-server" });
});
app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
});
// Auth route (Express 5 named wildcard)
app.all("/api/auth/*path", toNodeHandler(auth));
// JSON parser (auth er pore)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Vercel e disk e file thake na (chobi Cloudinary te), tai ei route shudhu local e kaje lage
app.use("/uploads", express.static(path.join(process.cwd(), "public/uploads")));
// Routes
app.use("/api/sliders", sliderRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/hajjah", hajjahRoutes);
// Shob error JSON hishebe ferot dey (multer / CORS / onno error)
const errorHandler = (err, _req, res, _next) => {
    console.error("Unhandled error:", err);
    if (err?.code === "LIMIT_FILE_SIZE") {
        res.status(400).json({ error: "Chobir size 2MB er beshi hote pabe na" });
        return;
    }
    const status = typeof err?.status === "number" ? err.status : 500;
    res.status(status).json({ error: err?.message || "Server error" });
};
app.use(errorHandler);
export default app;
//# sourceMappingURL=app.js.map