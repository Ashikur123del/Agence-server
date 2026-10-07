
// type/hajjah.type.ts

export type HajjahStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Hajjah {
    // Personal
    name: string;
    fathersName: string;
    mothersName?: string | null;
    dob: Date;
    gender?: string;
    maritalStatus?: string;
    nidNo: string;
    mobileNo: string;
    whatsappNo?: string | null;
    district?: string | null;
    presentAddress: string;
    permanentAddress?: string | null;
    photo?: string;

    // Passport
    passportNo: string;
    passportIssueDate?: Date | null;
    passportExpiry: Date;
    passportIssuePlace?: string | null;

    // Mahram
    mahramName?: string | null;
    mahramRelation?: string | null;
    mahramMobile?: string | null;
    mahramPassportNo?: string | null;

    // Health & Emergency
    bloodGroup?: string;
    medicalConditions?: string | null;
    meningitisVaccine?: boolean;
    emergencyContactName: string;
    emergencyContactRelation?: string;
    emergencyContactPhone: string;

    // Travel
    travelDate?: Date | null;
    roomType?: string;
    previousHajj?: boolean;
    specialAssistance?: string | null;
    notes?: string | null;

    // Package & Payment
    packageType?: string;
    totalAmount?: number;
    paidAmount?: number;
    paymentMethod?: string;
    paymentNumber?: string | null;
    transactionId?: string | null;
    referredBy?: string | null;

    // Agent (optional - kon agent registration korlo)
    agentId?: string | null;
}

export interface HajjahFilter {
    name?: string;
    mobileNo?: string;
    search?: string; // name ba mobile, duita theke ekshathe khuje
    status?: HajjahStatus;
    page?: number;
    limit?: number;
    agentId?: string;
}