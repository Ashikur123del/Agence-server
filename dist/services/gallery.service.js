import { prisma } from "../config/database.js";
export const GalleryService = {
    async createGallery(data) {
        return await prisma.gallery.create({ data });
    },
    async getAllGalleries() {
        return await prisma.gallery.findMany({
            orderBy: { createdAt: "desc" },
        });
    },
    async getGalleryById(id) {
        return await prisma.gallery.findUnique({
            where: { id },
        });
    },
    async updateGallery(id, data) {
        return await prisma.gallery.update({
            where: { id },
            data,
        });
    },
    async deleteGallery(id) {
        return await prisma.gallery.delete({
            where: { id },
        });
    },
};
//# sourceMappingURL=gallery.service.js.map