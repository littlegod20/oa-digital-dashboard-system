import { ConvexError, v } from "convex/values";
import { internalAction, internalMutation, query, type MutationCtx } from "./_generated/server";
import { components, internal } from "./_generated/api";
import { getViewer, initialsFor } from "./lib";
import { hashPassword } from "./password";
import { role } from "./schema";

/** The signed-in user's profile, or null when signed out. */
export const me = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewer(ctx);
    if (!viewer) return null;
    return {
      email: viewer.email,
      name: viewer.name,
      role: viewer.role,
      initials: viewer.initials,
    };
  },
});

/**
 * Creates a sign-in account. There is no public sign-up, so run this from the CLI:
 *   npx convex run users:createUser '{"email":"…","password":"…","name":"…","role":"sales"}'
 */
export const createUser = internalAction({
  args: { email: v.string(), password: v.string(), name: v.string(), role },
  // Explicit return type breaks the circular inference through `internal.users`.
  handler: async (ctx, args): Promise<string> => {
    if (args.password.length < 8) throw new ConvexError("Password must be at least 8 characters");
    const passwordHash = await hashPassword(args.password);
    return await ctx.runMutation(internal.users.insertCredentialUser, {
      email: args.email,
      name: args.name,
      role: args.role,
      passwordHash,
    });
  },
});

export const insertCredentialUser = internalMutation({
  args: { email: v.string(), name: v.string(), role, passwordHash: v.string() },
  handler: async (ctx, args) => insertCredentialUserImpl(ctx, args),
});

/**
 * Writes a Better Auth user + email/password account and the app profile.
 * Idempotent per email: re-running for an existing email only updates the profile.
 */
async function insertCredentialUserImpl(
  ctx: MutationCtx,
  args: { email: string; name: string; role: "management" | "sales"; passwordHash: string },
) {
  const email = args.email.trim().toLowerCase();
  const now = Date.now();

  const existing = (await ctx.runQuery(components.betterAuth.adapter.findOne, {
    model: "user",
    where: [{ field: "email", value: email }],
  })) as { _id: string } | null;

  let userId: string;
  if (existing) {
    userId = existing._id;
  } else {
    const user = (await ctx.runMutation(components.betterAuth.adapter.create, {
      input: {
        model: "user",
        data: {
          name: args.name,
          email,
          emailVerified: true,
          createdAt: now,
          updatedAt: now,
        },
      },
    })) as { _id: string };
    userId = user._id;
    await ctx.runMutation(components.betterAuth.adapter.create, {
      input: {
        model: "account",
        data: {
          accountId: userId,
          providerId: "credential",
          userId,
          password: args.passwordHash,
          createdAt: now,
          updatedAt: now,
        },
      },
    });
  }

  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique();
  const doc = { userId, email, name: args.name, role: args.role, initials: initialsFor(args.name) };
  if (profile) await ctx.db.patch(profile._id, doc);
  else await ctx.db.insert("profiles", doc);
  return userId;
}
