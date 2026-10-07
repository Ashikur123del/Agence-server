export declare const ContactService: {
    createContact(data: {
        name: string;
        phone: string;
        email?: string;
        service?: string;
        message: string;
    }): Promise<{
        id: string;
        name: string;
        phone: string;
        email: string | null;
        service: string | null;
        message: string;
        isRead: boolean;
        createdAt: Date;
        userId: string | null;
    }>;
    getAllContacts(): Promise<{
        id: string;
        name: string;
        phone: string;
        email: string | null;
        service: string | null;
        message: string;
        isRead: boolean;
        createdAt: Date;
        userId: string | null;
    }[]>;
    getContactById(id: string): Promise<{
        id: string;
        name: string;
        phone: string;
        email: string | null;
        service: string | null;
        message: string;
        isRead: boolean;
        createdAt: Date;
        userId: string | null;
    } | null>;
    updateContactStatus(id: string, isRead: boolean): Promise<{
        id: string;
        name: string;
        phone: string;
        email: string | null;
        service: string | null;
        message: string;
        isRead: boolean;
        createdAt: Date;
        userId: string | null;
    }>;
    updateContact(id: string, data: {
        name?: string;
        phone?: string;
        email?: string;
        service?: string;
        message?: string;
    }): Promise<{
        id: string;
        name: string;
        phone: string;
        email: string | null;
        service: string | null;
        message: string;
        isRead: boolean;
        createdAt: Date;
        userId: string | null;
    }>;
    deleteContact(id: string): Promise<{
        id: string;
        name: string;
        phone: string;
        email: string | null;
        service: string | null;
        message: string;
        isRead: boolean;
        createdAt: Date;
        userId: string | null;
    }>;
};
