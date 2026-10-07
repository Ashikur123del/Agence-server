// routes/hajjah.route.ts
import { Router } from "express";
import { hajjahController } from "../controllers/hajjah.controller.js";
import { uploadTo } from "../middlewares/upload.middleware.js";
import { requireAdmin, requireAuth } from "../middlewares/auth.middleware.js";
const router = Router();
const upload = uploadTo("hajjah");
// GET all (filter): /api/hajjah?name=rahima&mobileNo=017&status=PENDING&page=1&limit=20
router.get("/", requireAuth, hajjahController.getHajjahs);
// GET status count - /:id er age rakhte hobe
router.get("/stats", requireAuth, hajjahController.getStats);
// GET single hajjah by ID
router.get("/:id", requireAuth, hajjahController.getHajjahById);
// POST create hajjah (agent login lagbe, agentId session theke boshbe)
router.post("/", requireAuth, upload.single("photo"), hajjahController.createHajjah);
// PUT full update
router.put("/:id", requireAuth, upload.single("photo"), hajjahController.replaceHajjah);
// PATCH partial update
router.patch("/:id", requireAuth, upload.single("photo"), hajjahController.updateHajjah);
// PATCH approve / reject / reopen (Admin only)
router.patch("/:id/status", requireAdmin, hajjahController.reviewHajjah);
// DELETE hajjah by ID
router.delete("/:id", requireAuth, hajjahController.deleteHajjah);
export default router;
//# sourceMappingURL=hajjah.route.js.map