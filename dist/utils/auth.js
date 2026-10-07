import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins"; // ← Admin plugin ইমপোর্ট করুন
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../config/database.js";
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    // Admin & Role Plugin
    plugins: [
        admin({
            defaultRole: "user", // নতুন যেকোনো সাইনআপ-এ রোল হবে "user"
            adminRole: ["admin"],
        }),
    ],
    emailAndPassword: {
        enabled: true,
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // ৭ দিন
        updateAge: 60 * 60 * 24, // ১ দিন
    },
    trustedOrigins: [
        "https://travel-agance-hojj-umrah.vercel.app",
        "http://localhost:3000",
        "http://localhost:3001",
        process.env.FRONTEND_URL || "https://travel-agance-hojj-umrah.vercel.app",
    ],
    advanced: {
        useSecureCookies: process.env.NODE_ENV === "production",
        crossSubDomainCookies: {
            enabled: false,
        },
    },
    // Note: সব ইউজারের সাইনআপ চালু রাখতে চাইলে নিচের databaseHooks অংশটি সরিয়ে ফেলুন
    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    // উদাহরণ: নির্দিষ্ট ইমেইল হলে অটোমেটিক admin রোল সেট করা
                    if (user.email === "asikk2925@gmail.com") {
                        return {
                            data: {
                                ...user,
                                role: "admin",
                            },
                        };
                    }
                    return { data: user };
                },
            },
        },
    },
});
//# sourceMappingURL=auth.js.map