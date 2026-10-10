import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../utils/auth.js";
import { prisma } from "../config/database.js";
export const requireAuth = async (req, res, next) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });
        if (!session) {
            return res.status(401).json({
                error: "Please log in",
            });
        }
        const role = session.user.role;
        if (role !== "agent" && role !== "admin") {
            return res.status(403).json({
                error: "Not allowed",
            });
        }
        req.user = {
            id: session.user.id,
            role,
        };
        if (role === "agent") {
            const agent = await prisma.agent.findUnique({
                where: {
                    userId: session.user.id,
                },
                select: {
                    id: true,
                },
            });
            if (!agent) {
                return res.status(403).json({
                    error: "Agent profile not found",
                });
            }
            req.agentId = agent.id;
        }
        return next();
    }
    catch (error) {
        console.error("Authentication error:", error);
        return res.status(401).json({
            error: "Unauthorized",
        });
    }
};
export const requireAdmin = async (req, res, next) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });
        if (!session) {
            return res.status(401).json({
                error: "Please log in",
            });
        }
        if (session.user.role !== "admin") {
            return res.status(403).json({
                error: "Admin access required",
            });
        }
        req.user = {
            id: session.user.id,
            role: session.user.role,
        };
        return next();
    }
    catch (error) {
        console.error("Authentication error:", error);
        return res.status(401).json({
            error: "Unauthorized",
        });
    }
};
//# sourceMappingURL=auth.middleware.js.map