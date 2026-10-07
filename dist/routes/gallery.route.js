import { Router } from "express";
import { GalleryController } from "../controllers/gallery.controller.js";
import { upload } from "../middlewares/upload.middleware.js";
const router = Router();
router.post("/", upload.single("image"), GalleryController.create);
router.get("/", GalleryController.getAll);
router.get("/:id", GalleryController.getById);
router.put("/:id", upload.single("image"), GalleryController.update);
router.patch("/:id", upload.single("image"), GalleryController.update);
router.delete("/:id", GalleryController.remove);
export const galleryRoutes = router;
//# sourceMappingURL=gallery.route.js.map