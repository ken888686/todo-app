import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { serverEnv } from "./env";

export const auth = betterAuth({
  baseURL: serverEnv.betterAuthUrl,
  secret: serverEnv.betterAuthSecret,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: false,
  },
  socialProviders: {
    google: {
      accessType: "offline",
      prompt: "select_account consent",
      clientId: serverEnv.googleClientId,
      clientSecret: serverEnv.googleClientSecret,
    },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    storage: "database",
    customRules: {
      "/sign-in/social": {
        window: 60,
        max: 10,
      },
    },
  },
  plugins: [],
});
