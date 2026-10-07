import { Request, Response } from "express";
import { newsService } from "../services/news.service.js";


export const newsController = {
  async getNews(req: Request, res: Response) {
    try {
      const newsList = await newsService.getAllNews();
      return res.status(200).json(newsList);
    } catch (error) {
      console.error("Error fetching news:", error);
      return res.status(500).json({ error: "Failed to fetch news" });
    }
  },

  async getSingleNews(req: Request, res: Response) {
    try {
      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;

      const article = await newsService.getNewsById(id);

      if (!article) {
        return res.status(404).json({ error: "News article not found" });
      }

      return res.status(200).json(article);
    } catch (error) {
      console.error("Error fetching single news:", error);
      return res.status(500).json({ error: "Failed to fetch news article" });
    }
  },

  async createNews(req: any, res: Response) {
    try {
      const imagePath = req.file ? req.file.path : null;
      const {
        title,
        slug,
        category,
        categoryColor,
        excerpt,
        content,
        date,
        readTime,
        author,
        featured,
      } = req.body;

      if (
        !imagePath ||
        !title ||
        !slug ||
        !category ||
        !excerpt ||
        !content ||
        !date
      ) {
        return res
          .status(400)
          .json({ error: "Missing required fields or image file" });
      }

      const newArticle = await newsService.createNews({
        title,
        slug,
        category,
        categoryColor: categoryColor || "from-amber-500 to-orange-500",
        excerpt,
        content,
        image: imagePath,
        date,
        readTime,
        author,
        featured: featured === "true" || featured === true,
      });

      return res
        .status(201)
        .json({ message: "News created successfully", newArticle });
    } catch (error: any) {
      console.error("Error creating news:", error?.message || error);
      return res
        .status(500)
        .json({ error: error?.message || "Failed to create news" });
    }
  },

  async updateNews(req: any, res: Response) {
    try {
      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;

      const imagePath = req.file ? req.file.path : undefined;
      const {
        title,
        slug,
        category,
        categoryColor,
        excerpt,
        content,
        date,
        readTime,
        author,
        featured,
      } = req.body;

      const updateData: any = {};

      if (title !== undefined) updateData.title = title;
      if (slug !== undefined) updateData.slug = slug;
      if (category !== undefined) updateData.category = category;
      if (categoryColor !== undefined) updateData.categoryColor = categoryColor;
      if (excerpt !== undefined) updateData.excerpt = excerpt;
      if (content !== undefined) updateData.content = content;
      if (date !== undefined) updateData.date = date;
      if (readTime !== undefined) updateData.readTime = readTime;
      if (author !== undefined) updateData.author = author;
      if (featured !== undefined) {
        updateData.featured = featured === "true" || featured === true;
      }

      if (imagePath) {
        updateData.image = imagePath;
      }

      const updatedArticle = await newsService.updateNews(id, updateData);

      return res
        .status(200)
        .json({ message: "News updated successfully", updatedArticle });
    } catch (error: any) {
      console.error("Error updating news:", error?.message || error);
      return res
        .status(500)
        .json({ error: error?.message || "Failed to update news" });
    }
  },

  async deleteNews(req: Request, res: Response) {
    try {
      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;

      await newsService.deleteNews(id);
      return res.status(200).json({ message: "News deleted successfully" });
    } catch (error) {
      console.error("Error deleting news:", error);
      return res.status(500).json({ error: "Failed to delete news" });
    }
  },
};
