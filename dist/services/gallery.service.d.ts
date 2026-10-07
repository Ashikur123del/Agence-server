export declare const GalleryService: {
    createGallery(data: {
        title: string;
        category?: string;
        imageUrl: string;
    }): Promise<{
        id: string;
        title: string;
        category: string;
        imageUrl: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getAllGalleries(): Promise<{
        id: string;
        title: string;
        category: string;
        imageUrl: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getGalleryById(id: string): Promise<{
        id: string;
        title: string;
        category: string;
        imageUrl: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    updateGallery(id: string, data: {
        title?: string;
        category?: string;
        imageUrl?: string;
    }): Promise<{
        id: string;
        title: string;
        category: string;
        imageUrl: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteGallery(id: string): Promise<{
        id: string;
        title: string;
        category: string;
        imageUrl: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
};
