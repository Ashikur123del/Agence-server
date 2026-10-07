import { prisma } from "../config/database.js";

export const sliderService = {
  async getAllSliders() {
    return await prisma.heroSlider.findMany({
      orderBy: { createdAt: "desc" },
    });
  },

  async getSliderById(id: string) {
    return await prisma.heroSlider.findUnique({
      where: { id },
    });
  },

  async createSlider(data: {
    image: string;
    alt?: string;
    firstText: string;
    highlightText: string;
    secondText: string;
    description: string;
  }) {
    return await prisma.heroSlider.create({
      data: {
        image: data.image,
        alt: data.alt || "Slide image",
        firstText: data.firstText,
        highlightText: data.highlightText,
        secondText: data.secondText,
        description: data.description,
      },
    });
  },

  async updateSlider(id: string, data: any) {
    return await prisma.heroSlider.update({
      where: { id },
      data,
    });
  },

  async deleteSlider(id: string) {
    return await prisma.heroSlider.delete({
      where: { id },
    });
  },
};
