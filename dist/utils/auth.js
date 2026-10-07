import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../config/database.js";
import { allowedOrigins } from "./origins.js";
const isProd = process.env.NODE_ENV === "production";
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "asikk2925@gmail.com").toLowerCase();
export const auth = betterAuth({
    // Backend er nijer public URL (local: http://localhost:5000, Vercel: https://<backend>.vercel.app)
    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    plugins: [
        admin({
            defaultRole: "user",
            adminRole: ["admin"],
        }),
    ],
    emailAndPassword: {
        enabled: true,
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 din
        updateAge: 60 * 60 * 24, // 1 din
    },
    // Frontend er URL ekhane na thakle login e "Invalid origin" error ashe
    trustedOrigins: allowedOrigins,
    advanced: {
        useSecureCookies: isProd,
        crossSubDomainCookies: {
            enabled: false,
        },
    },
    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    // Admin email diye prothom sign up korle automatic admin role
                    // (admin account banano hoye gele ei hook ti muche felun)
                    if (user.email?.toLowerCase() === ADMIN_EMAIL) {
                        return { data: { ...user, role: "admin" } };
                    }
                    return { data: user };
                },
            },
        },
    },
});
//# sourceMappingURL=auth.js.map