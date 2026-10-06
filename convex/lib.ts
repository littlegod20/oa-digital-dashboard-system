import { ConvexError } from "convex/values";
import type { QueryCtx } from "./_generated/server";
import { authComponent } from "./auth";

/** The signed-in user's profile, or null when signed out. */
export async function getViewer(ctx: QueryCtx) {
  const user = await authComponent.safeGetAuthUser(ctx);
  if (!user) return null;
  return await ctx.db
    .query("profiles")
    .withIndex("by_userId", (q) => q.eq("userId", user._id))
    .unique();
}

/** Throws unless the caller is signed in and has a profile. */
export async function requireViewer(ctx: QueryCtx) {
  const viewer = await getViewer(ctx);
  if (!viewer) throw new ConvexError("Unauthenticated");
  return viewer;
}

/** Converts empty strings from forms into absent optional fields. */
export function optional(value: string | undefined | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function initialsFor(name: string) {
  return name
    .split(/\s+/)
    .filter((w) => /^[\p{L}\p{N}]/u.test(w))
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
