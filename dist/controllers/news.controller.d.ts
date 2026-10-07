import { Request, Response } from "express";
export declare const newsController: {
    getNews(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getSingleNews(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    createNews(req: any, res: Response): Promise<Response<any, Record<string, any>>>;
    updateNews(req: any, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteNews(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
};
