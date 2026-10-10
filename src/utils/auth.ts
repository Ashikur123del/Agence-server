import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../config/database.js";
import { allowedOrigins } from "./origins.js";

const isProd = process.env.NODE_ENV === "production";
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "asikk2925@gmail.com").toLowerCase();

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET is missing");
}

if (!process.env.BETTER_AUTH_URL) {
  throw new Error("BETTER_AUTH_URL is missing");
}

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
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },

  trustedOrigins: allowedOrigins,

  advanced: {
    // Production-এ secure cookie, local-এ plain
    useSecureCookies: isProd,

    crossSubDomainCookies: {
      enabled: false,
    },

    defaultCookieAttributes: {
      // Cross-origin (Vercel frontend ↔ backend) এর জন্য none
      sameSite: isProd ? "none" : "lax",
      secure: isProd, // sameSite: "none" হলে secure বাধ্যতামূলক
      httpOnly: true,
      path: "/",
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (user.email?.toLowerCase() === ADMIN_EMAIL) {
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