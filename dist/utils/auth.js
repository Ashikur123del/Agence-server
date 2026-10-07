import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../config/database.js";
import { allowedOrigins } from "./origins.js";
const isProd = process.env.NODE_ENV === "production";
export const auth = betterAuth({
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
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24,
    },
    trustedOrigins: allowedOrigins,
    advanced: {
        useSecureCookies: isProd,
        crossSubDomainCookies: {
            enabled: false,
        },
        defaultCookieAttributes: isProd
            ? {
                sameSite: "none",
                secure: true,
                httpOnly: true,
            }
            : {
                sameSite: "lax",
                secure: false,
                httpOnly: true,
            },
    },
});
//# sourceMappingURL=auth.js.map