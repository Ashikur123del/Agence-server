import { Request, Response } from "express";
export declare const sliderController: {
    getSliders(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getSliderById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    createSlider(req: any, res: Response): Promise<Response<any, Record<string, any>>>;
    updateSlider(req: any, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteSlider(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
};
