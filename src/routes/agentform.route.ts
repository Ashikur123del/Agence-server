import { Router } from "express";
import { agentFormController } from "../controllers/agentform.controller.js";
import { uploadTo } from "../middlewares/upload.middleware.js";
import { requireAdmin, requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();
const upload = uploadTo("agents");

// Public — Become Agent application
router.post("/", upload.single("photo"), agentFormController.createAgent);

// Agent login (mobile + password)
router.post("/verify", agentFormController.verifyAgent);

// Agent nijer profile: dekha ar edit kora (delete nai)
// ⚠️ "/me" ke obosshoy "/:id" er age rakhte hobe
router.get("/me", requireAuth, agentFormController.getMyProfile);
router.patch(
    "/me",
    requireAuth,
    upload.single("photo"),
    agentFormController.updateMyProfile
);

// Admin only — list / details / update / delete
router.get("/", requireAdmin, agentFormController.getAgents);
router.get("/:id", requireAdmin, agentFormController.getAgentById);
router.patch(
    "/:id",
    requireAdmin,
    upload.single("photo"),
    agentFormController.updateAgent
);
router.delete("/:id", requireAdmin, agentFormController.deleteAgent);

export default router;