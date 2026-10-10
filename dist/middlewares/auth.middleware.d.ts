import { Request, Response, NextFunction } from "express";
export interface AuthRequest extends Request {
    user?: {
        id: string;
        role?: string | null;
    };
    agentId?: string | null;
}
/** শুধু admin বা agent (সাধারণ "user" রোল ঢুকতে পারবে না) */
export declare const requireAuth: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/** শুধু Admin */
export declare const requireAdmin: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
