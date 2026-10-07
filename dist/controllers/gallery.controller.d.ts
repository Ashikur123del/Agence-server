import { Request, Response } from "express";
export declare const GalleryController: {
    create(req: any, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAll(req: Request, res: Response): Promise<void>;
    getById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    update(req: any, res: Response): Promise<void>;
    remove(req: Request, res: Response): Promise<void>;
};
