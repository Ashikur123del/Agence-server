import { Router } from "express";
import { newsController } from "../controllers/news.controller.js";
import { upload } from "../middlewares/upload.middleware.js";
const router = Router();
router.get("/", newsController.getNews);
router.get("/:id", newsController.getSingleNews);
router.post("/", upload.single("image"), newsController.createNews);
router.patch("/:id", upload.single("image"), newsController.updateNews);
router.delete("/:id", newsController.deleteNews);
export default router;
//# sourceMappingURL=news.route.js.map