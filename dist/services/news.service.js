import { prisma } from "../config/database.js";
export const newsService = {
    async getAllNews() {
        return await prisma.news.findMany({
            orderBy: { createdAt: "desc" },
        });
    },
    async getNewsById(id) {
        return await prisma.news.findUnique({
            where: { id },
        });
    },
    async getNewsBySlug(slug) {
        return await prisma.news.findUnique({
            where: { slug },
        });
    },
    async createNews(data) {
        return await prisma.news.create({
            data: {
                title: data.title,
                slug: data.slug,
                category: data.category,
                categoryColor: data.categoryColor,
                excerpt: data.excerpt,
                content: data.content,
                image: data.image,
                date: data.date,
                readTime: data.readTime || "3 min read",
                author: data.author || "Travel Desk",
                featured: data.featured,
            },
        });
    },
    async updateNews(id, data) {
        return await prisma.news.update({
            where: { id },
            data,
        });
    },
    async deleteNews(id) {
        return await prisma.news.delete({
            where: { id },
        });
    },
};
//# sourceMappingURL=news.service.js.map