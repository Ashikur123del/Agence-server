import { Router } from "express";
import { sliderController } from "../controllers/slider.controller.js";
import { upload } from "../middlewares/upload.middleware.js";
const router = Router();
router.get("/", sliderController.getSliders);
router.get("/:id", sliderController.getSliderById);
router.post("/", upload.single("image"), sliderController.createSlider);
router.put("/:id", upload.single("image"), sliderController.updateSlider);
router.delete("/:id", sliderController.deleteSlider);
export default router;
//# sourceMappingURL=slider.route.js.map