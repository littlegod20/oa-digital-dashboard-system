import { ConvexError, v } from "convex/values";
import { action, internalAction, internalMutation, internalQuery, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { getViewer } from "./lib";
import { can } from "./permissions";
import { hashPassword } from "./password";
import { revokeSessions, upsertCredentialUser } from "./users";

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

async function sha256(text: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export const inviterAndTarget = internalQuery({
  args: { employeeId: v.id("employees") },
  handler: async (ctx, { employeeId }) => {
    const viewer = await getViewer(ctx);
    if (!viewer || !can(viewer.accessRole, "people.manage")) return null;
    const target = await ctx.db.get(employeeId);
    if (!target || target.status !== "active") return null;
    return { inviterId: viewer._id, inviterName: viewer.name, name: target.name, email: target.email };
  },
});

export const storeInvite = internalMutation({
  args: { employeeId: v.id("employees"), tokenHash: v.string(), createdBy: v.id("employees") },
  handler: async (ctx, args) => {
    // A new link replaces any earlier unused ones.
    const old = await ctx.db.query("invites").withIndex("by_employee", (q) => q.eq("employeeId", args.employeeId)).collect();
    for (const i of old) if (!i.usedAt) await ctx.db.delete(i._id);
    const now = Date.now();
    await ctx.db.insert("invites", { ...args, expiresAt: now + INVITE_TTL_MS, createdAt: now });
  },
});

/**
 * Creates a fresh "set your password" link for someone (valid 7 days) and optionally emails it.
 * Runs as an action so the token comes from real randomness, not a mutation's seeded RNG.
 */
export const createInvite = action({
  args: { employeeId: v.id("employees"), sendEmail: v.boolean() },
  handler: async (ctx, { employeeId, sendEmail }): Promise<{ url: string; emailed: boolean }> => {
    const info = await ctx.runQuery(internal.invites.inviterAndTarget, { employeeId });
    if (!info) throw new ConvexError("You can't invite this person.");
    const token = randomToken();
    await ctx.runMutation(internal.invites.storeInvite, {
      employeeId,
      tokenHash: await sha256(token),
      createdBy: info.inviterId,
    });
    const url = `${process.env.SITE_URL}/invite?token=${token}`;
    if (sendEmail) {
      await ctx.runAction(internal.email.sendInvite, {
        to: info.email,
        name: info.name,
        inviterName: info.inviterName,
        url,
      });
    }
    return { url, emailed: sendEmail };
  },
});

export const employeeByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) =>
    await ctx.db.query("employees").withIndex("by_email", (q) => q.eq("email", email.trim().toLowerCase())).unique(),
});

/**
 * CLI-only: an invite link for someone when nobody can use the in-app Invite button yet
 * (e.g. the very first CEO login). `npx convex run --prod invites:bootstrapLink '{"email":"…"}'`
 */
export const bootstrapLink = internalAction({
  args: { email: v.string() },
  handler: async (ctx, { email }): Promise<string> => {
    const employee = await ctx.runQuery(internal.invites.employeeByEmail, { email });
    if (!employee || employee.status !== "active") throw new ConvexError(`No active employee with email ${email}`);
    const token = randomToken();
    await ctx.runMutation(internal.invites.storeInvite, {
      employeeId: employee._id,
      tokenHash: await sha256(token),
      createdBy: employee._id,
    });
    return `${process.env.SITE_URL}/invite?token=${token}`;
  },
});

/** What the invite page shows before someone sets their password. */
export const lookup = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const hash = await sha256(token);
    const found = await ctx.db.query("invites").withIndex("by_tokenHash", (q) => q.eq("tokenHash", hash)).unique();
    if (!found || found.usedAt || found.expiresAt < Date.now()) return { valid: false as const };
    const employee = await ctx.db.get(found.employeeId);
    if (!employee || employee.status !== "active") return { valid: false as const };
    return { valid: true as const, name: employee.name, email: employee.email, jobTitle: employee.jobTitle };
  },
});

export const consumeInvite = internalMutation({
  args: { tokenHash: v.string(), passwordHash: v.string() },
  handler: async (ctx, { tokenHash, passwordHash }): Promise<{ email: string }> => {
    const invite = await ctx.db.query("invites").withIndex("by_tokenHash", (q) => q.eq("tokenHash", tokenHash)).unique();
    if (!invite || invite.usedAt || invite.expiresAt < Date.now()) {
      throw new ConvexError("This invite link is invalid or has expired. Ask for a new one.");
    }
    const employee = await ctx.db.get(invite.employeeId);
    if (!employee || employee.status !== "active") throw new ConvexError("This account is no longer active.");

    const userId = await upsertCredentialUser(ctx, { email: employee.email, name: employee.name, passwordHash });
    // Accepting an invite resets access: sign out any other sessions for this login.
    await revokeSessions(ctx, userId);
    await ctx.db.patch(employee._id, { userId });
    await ctx.db.patch(invite._id, { usedAt: Date.now() });
    return { email: employee.email };
  },
});

/** Sets the password from an invite link. The page then signs in with it. */
export const accept = action({
  args: { token: v.string(), password: v.string() },
  handler: async (ctx, { token, password }): Promise<{ email: string }> => {
    if (password.length < 8) throw new ConvexError("Password must be at least 8 characters.");
    return await ctx.runMutation(internal.invites.consumeInvite, {
      tokenHash: await sha256(token),
      passwordHash: await hashPassword(password),
    });
  },
});
