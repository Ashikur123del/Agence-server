// services/payment.service.ts
import { prisma } from "../config/database.js";
import { HttpError } from "./hajjah.sevvice.js";
const include = {
    hajjah: {
        select: {
            id: true,
            name: true,
            slNo: true,
            mobileNo: true,
            totalAmount: true,
            paidAmount: true,
        },
    },
    agent: { select: { id: true, name: true, mobileNo: true } },
};
export const paymentService = {
    // ============ Agent request pathay ============
    async createRequest(input) {
        const hajjah = await prisma.hajjah.findUnique({
            where: { id: input.hajjahId },
            select: { id: true, agentId: true, status: true, totalAmount: true, paidAmount: true },
        });
        if (!hajjah)
            throw new HttpError(404, "Hajjah not found");
        if (hajjah.agentId !== input.agentId)
            throw new HttpError(403, "This hajjah apnar na");
        if (hajjah.status === "REJECTED") {
            throw new HttpError(409, "Rejected hajjah er jonno payment neya jabe na");
        }
        const due = Math.max(hajjah.totalAmount - hajjah.paidAmount, 0);
        // Ager pending request gulor taka-o dhorte hobe, jeno beshi pathano na hoy
        const pending = await prisma.paymentRequest.aggregate({
            _sum: { amount: true },
            where: { hajjahId: hajjah.id, status: "PENDING" },
        });
        const pendingSum = pending._sum.amount ?? 0;
        const available = due - pendingSum;
        if (input.amount > available) {
            throw new HttpError(409, available <= 0
                ? `Baki ${due} taka, ar shob-i pending request e ache`
                : `Ar maximum ${available} taka pathano jabe (baki ${due}, pending ${pendingSum})`);
        }
        // Ekii Transaction ID duibar na
        if (input.transactionId) {
            const dup = await prisma.paymentRequest.findFirst({
                where: {
                    transactionId: input.transactionId,
                    status: { in: ["PENDING", "APPROVED"] },
                },
                select: { id: true },
            });
            if (dup)
                throw new HttpError(409, "Ei Transaction ID age-i deya hoyeche");
        }
        return await prisma.paymentRequest.create({
            data: {
                hajjahId: hajjah.id,
                agentId: input.agentId,
                amount: input.amount,
                method: input.method,
                paymentNumber: input.paymentNumber || null,
                transactionId: input.transactionId || null,
                note: input.note || null,
            },
            include,
        });
    },
    // ============ List (agent nijer, admin shob) ============
    async list(filters) {
        const { status, agentId, hajjahId, page = 1, limit = 10 } = filters;
        const where = {};
        if (status)
            where.status = status;
        if (agentId)
            where.agentId = agentId;
        if (hajjahId)
            where.hajjahId = hajjahId;
        const [items, total] = await prisma.$transaction([
            prisma.paymentRequest.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
                include,
            }),
            prisma.paymentRequest.count({ where }),
        ]);
        return {
            data: items,
            meta: { total, page, limit, totalPages: Math.max(Math.ceil(total / limit), 1) },
        };
    },
    // ============ Admin approve / reject ============
    async review(id, status, reviewerId, rejectReason) {
        return await prisma.$transaction(async (tx) => {
            const request = await tx.paymentRequest.findUnique({ where: { id } });
            if (!request)
                throw new HttpError(404, "Payment request not found");
            if (request.status !== "PENDING") {
                throw new HttpError(409, `Eta age-i ${request.status.toLowerCase()} kora hoyeche`);
            }
            // Duijon admin ekshathe click korle shudhu ekjon er-i kaj hobe
            const claimed = await tx.paymentRequest.updateMany({
                where: { id, status: "PENDING" },
                data: {
                    status,
                    reviewedById: reviewerId,
                    reviewedAt: new Date(),
                    rejectReason: status === "REJECTED" ? rejectReason ?? null : null,
                },
            });
            if (claimed.count === 0)
                throw new HttpError(409, "Eta age-i review kora hoyeche");
            if (status === "APPROVED") {
                const hajjah = await tx.hajjah.findUnique({
                    where: { id: request.hajjahId },
                    select: { totalAmount: true, paidAmount: true },
                });
                if (!hajjah)
                    throw new HttpError(404, "Hajjah not found");
                // Error dile pura transaction (claim shoho) rollback hoy
                if (hajjah.paidAmount + request.amount > hajjah.totalAmount) {
                    throw new HttpError(409, "Approve korle Paid, Total er beshi hoye jabe");
                }
                await tx.hajjah.update({
                    where: { id: request.hajjahId },
                    data: {
                        paidAmount: { increment: request.amount },
                        paymentMethod: request.method,
                        ...(request.paymentNumber ? { paymentNumber: request.paymentNumber } : {}),
                        ...(request.transactionId ? { transactionId: request.transactionId } : {}),
                    },
                });
            }
            return await tx.paymentRequest.findUnique({ where: { id }, include });
        });
    },
    // ============ Agent nijer pending request cancel ============
    async cancel(id, agentId) {
        const result = await prisma.paymentRequest.deleteMany({
            where: { id, agentId, status: "PENDING" },
        });
        if (result.count === 0) {
            const exists = await prisma.paymentRequest.findFirst({
                where: { id, agentId },
                select: { status: true },
            });
            if (!exists)
                throw new HttpError(404, "Payment request not found");
            throw new HttpError(409, "Shudhu pending request cancel kora jay");
        }
    },
};
//# sourceMappingURL=Payment.service.js.map