import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth/minimal";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import authConfig from "./auth.config";
import { hashPassword, verifyPassword } from "./password";

const siteUrl = process.env.SITE_URL!;

export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    baseURL: siteUrl,
    trustedOrigins: [siteUrl],
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      // There is no public sign-up; accounts are created with `users:createUser`.
      disableSignUp: true,
      minPasswordLength: 8,
      // bcrypt keeps the password hashes imported from the old Postgres database valid.
      password: {
        hash: hashPassword,
        verify: ({ hash, password }) => verifyPassword(password, hash),
      },
      resetPasswordTokenExpiresIn: 60 * 60,
      sendResetPassword: async ({ user, url }) => {
        // No email provider is configured yet. The link is written to the Convex
        // logs so an administrator can pass it on.
        console.log(`[password-reset] ${user.email}: ${url}`);
      },
    },
    session: {
      expiresIn: 60 * 60 * 8,
    },
    plugins: [convex({ authConfig })],
  });
};
