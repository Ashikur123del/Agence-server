// controllers/payment.controller.ts
import { Response } from "express";

import { HttpError } from "../services/hajjah.sevvice.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { paymentService } from "../services/Payment.service.js";

const BD_PHONE = /^01[3-9]\d{8}$/;
const METHODS = ["bKash", "Nagad", "Bank", "Cash"];
const STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
type Status = (typeof STATUSES)[number];

const getRouteParamId = (value: string | string[] | undefined): string => {
    if (Array.isArray(value)) return value[0] ?? "";
    return value ?? "";
};

const getQueryString = (value: unknown): string | undefined => {
    const v = Array.isArray(value) ? value[0] : value;
    return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
};

const handleError = (res: Response, error: any, fallback: string) => {
    if (error instanceof HttpError) {
        return res.status(error.status).json({ error: error.message });
    }
    if (error?.code === "P2025") {
        return res.status(404).json({ error: "Not found" });
    }
    console.error(`${fallback}:`, error);
    return res.status(500).json({ error: error?.message || fallback });
};

export const paymentController = {
    // POST /api/payments  (shudhu Agent)
    async createRequest(req: AuthRequest, res: Response) {
        try {
            if (req.user?.role !== "agent" || !req.agentId) {
                return res.status(403).json({ error: "Shudhu Agent payment request pathate pare" });
            }

            const hajjahId = String(req.body.hajjahId ?? "").trim();
            const amount = Number(req.body.amount);
            const method = String(req.body.method ?? "").trim();
            const paymentNumber = String(req.body.paymentNumber ?? "").replace(/\D/g, "");
            const transactionId = String(req.body.transactionId ?? "").trim();
            const note = String(req.body.note ?? "").trim();

            if (!hajjahId) return res.status(400).json({ error: "hajjahId dorkar" });
            if (!Number.isInteger(amount) || amount <= 0) {
                return res.status(400).json({ error: "Taka er poriman sothik din" });
            }
            if (!METHODS.includes(method)) {
                return res.status(400).json({ error: "Method bKash, Nagad, Bank ba Cash hote hobe" });
            }
            if (method !== "Cash") {
                if (!transactionId) {
                    return res.status(400).json({ error: "Transaction ID dorkar" });
                }
                if (paymentNumber && !BD_PHONE.test(paymentNumber)) {
                    return res.status(400).json({ error: "Sothik payment number din (01XXXXXXXXX)" });
                }
            }

            const created = await paymentService.createRequest({
                hajjahId,
                agentId: req.agentId,
                amount,
                method,
                paymentNumber: paymentNumber || undefined,
                transactionId: transactionId || undefined,
                note: note || undefined,
            });

            return res.status(201).json({
                message: "Payment request pathano hoyeche. Admin approve korle taka joma hobe.",
                request: created,
            });
        } catch (error) {
            return handleError(res, error, "Failed to create payment request");
        }
    },

    // GET /api/payments?status=&page=&limit=   (agent: nijer, admin: shob)
    async listRequests(req: AuthRequest, res: Response) {
        try {
            const statusQuery = getQueryString(req.query.status)?.toUpperCase();
            if (statusQuery && !STATUSES.includes(statusQuery as Status)) {
                return res.status(400).json({ error: "Invalid status filter" });
            }

            const page = Math.max(parseInt(getQueryString(req.query.page) ?? "1", 10) || 1, 1);
            const limit = Math.min(
                Math.max(parseInt(getQueryString(req.query.limit) ?? "10", 10) || 10, 1),
                100
            );

            const result = await paymentService.list({
                status: statusQuery as Status | undefined,
                hajjahId: getQueryString(req.query.hajjahId),
                agentId: req.user?.role === "agent" ? req.agentId ?? undefined : undefined,
                page,
                limit,
            });

            return res.status(200).json(result);
        } catch (error) {
            return handleError(res, error, "Failed to fetch payment requests");
        }
    },

    // PATCH /api/payments/:id/review  (shudhu Admin)
    // body: { status: "APPROVED" | "REJECTED", rejectReason?: string }
    async reviewRequest(req: AuthRequest, res: Response) {
        try {
            const id = getRouteParamId(req.params.id);
            const status = String(req.body.status ?? "").toUpperCase();
            const rejectReason =
                typeof req.body.rejectReason === "string" ? req.body.rejectReason.trim() : undefined;

            if (status !== "APPROVED" && status !== "REJECTED") {
                return res.status(400).json({ error: "status APPROVED ba REJECTED hote hobe" });
            }
            if (status === "REJECTED" && !rejectReason) {
                return res.status(400).json({ error: "Reject korar karon likhte hobe" });
            }

            const reviewerId = req.user?.id;
            if (!reviewerId) return res.status(401).json({ error: "Login dorkar" });

            const updated = await paymentService.review(id, status, reviewerId, rejectReason);

            return res.status(200).json({
                message: status === "APPROVED" ? "Payment approved, taka joma hoyeche" : "Payment rejected",
                request: updated,
            });
        } catch (error) {
            return handleError(res, error, "Failed to review payment request");
        }
    },

    // DELETE /api/payments/:id  (Agent nijer pending request cancel)
    async cancelRequest(req: AuthRequest, res: Response) {
        try {
            if (req.user?.role !== "agent" || !req.agentId) {
                return res.status(403).json({ error: "Shudhu Agent nijer request cancel korte pare" });
            }
            await paymentService.cancel(getRouteParamId(req.params.id), req.agentId);
            return res.status(200).json({ message: "Request cancel kora hoyeche" });
        } catch (error) {
            return handleError(res, error, "Failed to cancel payment request");
        }
    },
};