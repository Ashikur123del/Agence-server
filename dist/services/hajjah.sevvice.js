// services/hajjah.service.ts
import { prisma } from "../config/database.js";
export class HttpError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}
const agentSelect = { select: { id: true, name: true, mobileNo: true } };
export const hajjahService = {
    // ============ GET ALL (filter + pagination) ============
    async getAllHajjahs(filters) {
        const { name, mobileNo, search, status, page = 1, limit = 20, agentId } = filters;
        const where = {};
        if (name) {
            where.name = { contains: name, mode: "insensitive" };
        }
        if (mobileNo) {
            where.mobileNo = { contains: mobileNo.replace(/\D/g, "") };
        }
        // Ekta search box theke name ba mobile dui-ei khujte chaile
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { mobileNo: { contains: search.replace(/\D/g, "") || search } },
            ];
        }
        if (status) {
            where.status = status;
        }
        if (agentId) {
            where.agentId = agentId;
        }
        const [items, total] = await prisma.$transaction([
            prisma.hajjah.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
                include: { agent: agentSelect },
            }),
            prisma.hajjah.count({ where }),
        ]);
        return {
            data: items,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    },
    // ============ STATUS COUNT (Pending / Approved / Rejected tab er jonno) ============
    async getStatusCounts(agentId) {
        const rows = await prisma.hajjah.groupBy({
            by: ["status"],
            _count: { _all: true },
            where: agentId ? { agentId } : undefined,
        });
        const counts = {
            PENDING: 0,
            APPROVED: 0,
            REJECTED: 0,
        };
        for (const row of rows) {
            counts[row.status] = row._count._all;
        }
        return counts;
    },
    // ============ GET ONE ============
    async getHajjahById(id) {
        return await prisma.hajjah.findUnique({
            where: { id },
            include: { agent: agentSelect },
        });
    },
    // ============ CREATE (status shobshomoy PENDING) ============
    async createHajjah(data) {
        return await prisma.hajjah.create({
            data: {
                ...data,
                status: "PENDING",
            },
        });
    },
    // ============ UPDATE (PUT / PATCH duitar jonno) ============
    async updateHajjah(id, data) {
        return await prisma.hajjah.update({
            where: { id },
            data,
        });
    },
    // ============ APPROVE / REJECT / REOPEN ============
    async reviewHajjah(id, status, reviewerId, rejectReason) {
        // PENDING -> APPROVED / REJECTED
        // REJECTED -> PENDING (reopen)
        const allowedFrom = status === "PENDING" ? ["REJECTED"] : ["PENDING"];
        // updateMany: duijon admin ekshathe click korle shudhu ekjon er update hobe
        const result = await prisma.hajjah.updateMany({
            where: { id, status: { in: allowedFrom } },
            data: {
                status,
                reviewedById: status === "PENDING" ? null : reviewerId,
                reviewedAt: status === "PENDING" ? null : new Date(),
                rejectReason: status === "REJECTED" ? rejectReason : null,
            },
        });
        if (result.count === 0) {
            const exists = await prisma.hajjah.findUnique({
                where: { id },
                select: { status: true },
            });
            if (!exists)
                throw new HttpError(404, "Hajjah not found");
            throw new HttpError(409, `Current status ${exists.status} theke ${status} e change kora jabe na`);
        }
        return await prisma.hajjah.findUnique({ where: { id } });
    },
    // ============ DELETE ============
    async deleteHajjah(id) {
        const existing = await prisma.hajjah.findUnique({
            where: { id },
            select: { status: true },
        });
        if (!existing)
            throw new HttpError(404, "Hajjah not found");
        if (existing.status === "APPROVED") {
            throw new HttpError(409, "Approved registration delete kora jabe na");
        }
        return await prisma.hajjah.delete({ where: { id } });
    },
};
//# sourceMappingURL=hajjah.sevvice.js.map