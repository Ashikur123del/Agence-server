import { Router } from "express";
import { ContactController } from "../controllers/contact.controller.js";
const router = Router();
router.post("/", ContactController.create);
router.get("/", ContactController.getAll);
router.get("/:id", ContactController.getById);
router.patch("/:id", ContactController.update);
router.delete("/:id", ContactController.remove);
export default router;
//# sourceMappingURL=contact.route.js.map