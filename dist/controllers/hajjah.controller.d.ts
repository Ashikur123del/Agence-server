import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
interface MulterRequest extends AuthRequest {
    file?: Express.Multer.File & {
        path?: string;
    };
}
export declare const hajjahController: {
    getHajjahs(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getStats(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getHajjahById(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    createHajjah(req: MulterRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    replaceHajjah(req: MulterRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    updateHajjah(req: MulterRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    reviewHajjah(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteHajjah(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
};
export {};
