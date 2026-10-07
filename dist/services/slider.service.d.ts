export declare const sliderService: {
    getAllSliders(): Promise<{
        id: string;
        image: string;
        alt: string | null;
        firstText: string;
        highlightText: string;
        secondText: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getSliderById(id: string): Promise<{
        id: string;
        image: string;
        alt: string | null;
        firstText: string;
        highlightText: string;
        secondText: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    createSlider(data: {
        image: string;
        alt?: string;
        firstText: string;
        highlightText: string;
        secondText: string;
        description: string;
    }): Promise<{
        id: string;
        image: string;
        alt: string | null;
        firstText: string;
        highlightText: string;
        secondText: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateSlider(id: string, data: any): Promise<{
        id: string;
        image: string;
        alt: string | null;
        firstText: string;
        highlightText: string;
        secondText: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteSlider(id: string): Promise<{
        id: string;
        image: string;
        alt: string | null;
        firstText: string;
        highlightText: string;
        secondText: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
};
