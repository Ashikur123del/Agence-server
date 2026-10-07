import { prisma } from "../config/database.js";

export const agentFormService = {

    async getAllAgents() {
        return await prisma.agent.findMany({
            orderBy: { createdAt: "desc" },
            include: { user: true },
        });
    },

    async getAgentById(id: string) {
        return await prisma.agent.findUnique({
            where: { id },
            include: { user: true },
        });
    },

    async findByMobile(mobileNo: string) {
        return await prisma.agent.findFirst({
            where: { mobileNo: mobileNo.trim() },
        });
    },

    // 👈 verifyAgent-এর জন্য এই মেথডটি যোগ করা হয়েছে
    async findByMobileWithUser(mobileNo: string) {
        return await prisma.agent.findFirst({
            where: { mobileNo: mobileNo.trim() },
            include: { user: true },
        });
    },

    async createAgentWithUser(data: {
        agent: Record<string, any>;
        userId: string;
    }) {
        return await prisma.$transaction(async (tx) => {
            // ১. ইউজারের রোল 'agent' করা
            await tx.user.update({
                where: { id: data.userId },
                data: { role: "agent" },
            });

            // ২. এজেন্টের প্রোফাইল তৈরি
            const agent = await tx.agent.create({
                data: {
                    name: data.agent.name,
                    fathersName: data.agent.fathersName,
                    mobileNo: data.agent.mobileNo,
                    whatsAppNumber: data.agent.whatsAppNumber || undefined,
                    bkashNumber: data.agent.bkashNumber || undefined,
                    bankAccountNumber: data.agent.bankAccountNumber || undefined,
                    presentAddress: data.agent.presentAddress,
                    permanentAddress: data.agent.permanentAddress,
                    emergencyName: data.agent.emergencyName,
                    emergencyRelation: data.agent.emergencyRelation,
                    emergencyMobile: data.agent.emergencyMobile,
                    emergencyAddress: data.agent.emergencyAddress,
                    photo: data.agent.photo || undefined,
                    userId: data.userId,
                },
                include: { user: true },
            });

            return agent;
        });
    },

    async updateAgent(id: string, data: Record<string, any>) {
        return await prisma.agent.update({
            where: { id },
            data,
        });
    },

    async deleteAgent(id: string) {
        return await prisma.$transaction(async (tx) => {
            const agent = await tx.agent.findUnique({
                where: { id },
                select: { userId: true },
            });

            if (!agent) throw new Error("Agent not found");

            // Agent ডিলিট করা
            await tx.agent.delete({ where: { id } });

            // সম্পর্কিত User-ও ডিলিট করে দেওয়া
            if (agent.userId) {
                await tx.user.delete({ where: { id: agent.userId } });
            }
        });
    },
};