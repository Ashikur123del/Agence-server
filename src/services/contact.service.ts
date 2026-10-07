import { prisma } from "../config/database.js";

export const ContactService = {
  async createContact(data: {
    name: string;
    phone: string;
    email?: string;
    service?: string;
    message: string;
  }) {
    return await prisma.contactMessage.create({ data });
  },

  async getAllContacts() {
    return await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });
  },

  async getContactById(id: string) {
    return await prisma.contactMessage.findUnique({
      where: { id },
    });
  },

  async updateContactStatus(id: string, isRead: boolean) {
    return await prisma.contactMessage.update({
      where: { id },
      data: { isRead },
    });
  },

  async updateContact(
    id: string,
    data: {
      name?: string;
      phone?: string;
      email?: string;
      service?: string;
      message?: string;
    }
  ) {
    return await prisma.contactMessage.update({
      where: { id },
      data,
    });
  },

  async deleteContact(id: string) {
    return await prisma.contactMessage.delete({
      where: { id },
    });
  },
};