// routes/payment.route.ts
import { Router } from "express";

import { requireAdmin, requireAuth } from "../middlewares/auth.middleware.js";
import { paymentController } from "../controllers/Payment.controller.js";

const router = Router();

// Agent: nijer request pathay | Admin: shob request dekhe
router.post("/", requireAuth, paymentController.createRequest);
router.get("/", requireAuth, paymentController.listRequests);

// Admin: approve / reject
router.patch("/:id/review", requireAdmin, paymentController.reviewRequest);

// Agent: nijer pending request cancel
router.delete("/:id", requireAuth, paymentController.cancelRequest);

export default router;