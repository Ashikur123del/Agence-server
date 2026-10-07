import { sliderService } from "../services/slider.service.js";
export const sliderController = {
    async getSliders(req, res) {
        try {
            const sliders = await sliderService.getAllSliders();
            return res.status(200).json(sliders);
        }
        catch (error) {
            console.error("Error fetching sliders:", error);
            return res.status(500).json({ error: "Failed to fetch sliders" });
        }
    },
    async getSliderById(req, res) {
        try {
            const rawId = req.params.id;
            const id = Array.isArray(rawId) ? rawId[0] : rawId;
            const slider = await sliderService.getSliderById(id);
            if (!slider) {
                return res.status(404).json({ error: "Slider not found" });
            }
            return res.status(200).json(slider);
        }
        catch (error) {
            console.error("Error fetching slider details:", error);
            return res.status(500).json({ error: "Failed to fetch slider details" });
        }
    },
    async createSlider(req, res) {
        try {
            const imagePath = req.file ? req.file.path : null;
            const { alt, firstText, highlightText, secondText, description } = req.body;
            if (!imagePath || !firstText || !highlightText || !secondText || !description) {
                return res.status(400).json({ error: "Missing required fields or image file" });
            }
            const newSlide = await sliderService.createSlider({
                image: imagePath,
                alt: alt || "Slide image",
                firstText,
                highlightText,
                secondText,
                description,
            });
            return res.status(201).json({ message: "Slide created successfully", newSlide });
        }
        catch (error) {
            console.error("==================== FULL ERROR START ====================");
            console.error(error);
            console.error("JSON STRINGIFIED:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
            console.error("===================== FULL ERROR END =====================");
            return res.status(500).json({ error: "Failed to create slide" });
        }
    },
    async updateSlider(req, res) {
        try {
            const rawId = req.params.id;
            const id = Array.isArray(rawId) ? rawId[0] : rawId;
            const { alt, firstText, highlightText, secondText, description } = req.body;
            const imagePath = req.file ? req.file.path : req.body.image;
            const updatedSlide = await sliderService.updateSlider(id, {
                ...(imagePath && { image: imagePath }),
                ...(alt && { alt }),
                ...(firstText && { firstText }),
                ...(highlightText && { highlightText }),
                ...(secondText && { secondText }),
                ...(description && { description }),
            });
            return res.status(200).json({ message: "Slide updated successfully", updatedSlide });
        }
        catch (error) {
            console.error("Error updating slider:", error?.message || error);
            return res.status(500).json({ error: error?.message || "Failed to update slide" });
        }
    },
    async deleteSlider(req, res) {
        try {
            const rawId = req.params.id;
            const id = Array.isArray(rawId) ? rawId[0] : rawId;
            await sliderService.deleteSlider(id);
            return res.status(200).json({ message: "Slide deleted successfully" });
        }
        catch (error) {
            console.error("Error deleting slider:", error);
            return res.status(500).json({ error: "Failed to delete slide" });
        }
    },
};
//# sourceMappingURL=slider.controller.js.map