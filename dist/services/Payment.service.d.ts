type ReviewStatus = "APPROVED" | "REJECTED";
type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";
export declare const paymentService: {
    createRequest(input: {
        hajjahId: string;
        agentId: string;
        amount: number;
        method: string;
        paymentNumber?: string;
        transactionId?: string;
        note?: string;
    }): Promise<{
        agent: {
            id: string;
            mobileNo: string;
            name: string;
        } | null;
        hajjah: {
            id: string;
            mobileNo: string;
            name: string;
            paidAmount: number;
            slNo: number;
            totalAmount: number;
        };
    } & {
        id: string;
        hajjahId: string;
        agentId: string | null;
        amount: number;
        method: string;
        paymentNumber: string | null;
        transactionId: string | null;
        note: string | null;
        status: import("@prisma/client").$Enums.PaymentRequestStatus;
        reviewedById: string | null;
        reviewedAt: Date | null;
        rejectReason: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    list(filters: {
        status?: RequestStatus;
        agentId?: string;
        hajjahId?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: ({
            agent: {
                id: string;
                mobileNo: string;
                name: string;
            } | null;
            hajjah: {
                id: string;
                mobileNo: string;
                name: string;
                paidAmount: number;
                slNo: number;
                totalAmount: number;
            };
        } & {
            id: string;
            hajjahId: string;
            agentId: string | null;
            amount: number;
            method: string;
            paymentNumber: string | null;
            transactionId: string | null;
            note: string | null;
            status: import("@prisma/client").$Enums.PaymentRequestStatus;
            reviewedById: string | null;
            reviewedAt: Date | null;
            rejectReason: string | null;
            createdAt: Date;
            updatedAt: Date;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    review(id: string, status: ReviewStatus, reviewerId: string, rejectReason?: string): Promise<({
        agent: {
            id: string;
            mobileNo: string;
            name: string;
        } | null;
        hajjah: {
            id: string;
            mobileNo: string;
            name: string;
            paidAmount: number;
            slNo: number;
            totalAmount: number;
        };
    } & {
        id: string;
        hajjahId: string;
        agentId: string | null;
        amount: number;
        method: string;
        paymentNumber: string | null;
        transactionId: string | null;
        note: string | null;
        status: import("@prisma/client").$Enums.PaymentRequestStatus;
        reviewedById: string | null;
        reviewedAt: Date | null;
        rejectReason: string | null;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    cancel(id: string, agentId: string): Promise<void>;
};
export {};
