import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
export declare const paymentController: {
    createRequest(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    listRequests(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    reviewRequest(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    cancelRequest(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
};
