import { Request, Response } from "express";
import { GalleryService } from "../services/gallery.service.js";

export const GalleryController = {

  async create(req: any, res: Response) {
    try {
      const imagePath = req.file ? req.file.path : null;
      const { title, category } = req.body;

      if (!title || !imagePath) {
        return res.status(400).json({ success: false, message: "Title and Image are required" });
      }

      const gallery = await GalleryService.createGallery({
        title,
        category: category || "Hotels",
        imageUrl: imagePath,
      });
      res.status(201).json({ success: true, data: gallery });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const galleries = await GalleryService.getAllGalleries();
      res.status(200).json({ success: true, data: galleries });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },


  async getById(req: Request, res: Response) {
    try {
      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;
      const gallery = await GalleryService.getGalleryById(id);

      if (!gallery) {
        return res.status(404).json({ success: false, message: "Gallery item not found" });
      }
      res.status(200).json({ success: true, data: gallery });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },


  async update(req: any, res: Response) {
    try {
      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;
      const { title, category } = req.body;

      const imagePath = req.file ? req.file.path : req.body.imageUrl;

      const updated = await GalleryService.updateGallery(id, {
        ...(title && { title }),
        ...(category && { category }),
        ...(imagePath && { imageUrl: imagePath }),
      });
      res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;

      await GalleryService.deleteGallery(id);
      res.status(200).json({ success: true, message: "Gallery item deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};