import { prisma } from "../config/database.js";   

export const GalleryService = {
 
  async createGallery(data: { title: string; category?: string; imageUrl: string }) {
    return await prisma.gallery.create({ data });
  },

 
  async getAllGalleries() {
    return await prisma.gallery.findMany({
      orderBy: { createdAt: "desc" },
    });
  },


  async getGalleryById(id: string) {
    return await prisma.gallery.findUnique({
      where: { id },
    });
  },


  async updateGallery(id: string, data: { title?: string; category?: string; imageUrl?: string }) {
    return await prisma.gallery.update({
      where: { id },
      data,
    });
  },

  async deleteGallery(id: string) {
    return await prisma.gallery.delete({
      where: { id },
    });
  },
};