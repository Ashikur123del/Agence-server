import { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../utils/auth.js";
import { prisma } from "../config/database.js";

export interface AuthRequest extends Request {
    user?: { id: string; role?: string | null };
    agentId?: string | null;
}

/** শুধু admin বা agent (সাধারণ "user" রোল ঢুকতে পারবে না) */
export const requireAuth = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (!session) {
            return res.status(401).json({ error: "Login dorkar" });
        }

        const role = (session.user as any).role as string | undefined;

        if (role !== "agent" && role !== "admin") {
            return res.status(403).json({ error: "Not allowed" });
        }

        req.user = { id: session.user.id, role };

        // Agent হলে agentId বসিয়ে দিন
        if (role === "agent") {
            const agent = await prisma.agent.findUnique({
                where: { userId: session.user.id },
                select: { id: true },
            });
            req.agentId = agent?.id ?? null;

            if (!req.agentId) {
                return res.status(403).json({ error: "Agent profile pai nai" });
            }
        }

        next();
    } catch (error) {
        console.error("Auth error:", error);
        return res.status(401).json({ error: "Unauthorized" });
    }
};

/** শুধু Admin */
export const requireAdmin = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (!session) {
            return res.status(401).json({ error: "Login dorkar" });
        }

        const role = (session.user as any).role as string | undefined;

        if (role !== "admin") {
            return res.status(403).json({ error: "Shudhu Admin ei kaj korte pare" });
        }

        req.user = { id: session.user.id, role };
        next();
    } catch (error) {
        console.error("Auth error:", error);
        return res.status(401).json({ error: "Unauthorized" });
    }
};