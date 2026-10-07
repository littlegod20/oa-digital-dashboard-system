import { ConvexError } from "convex/values";
import type { QueryCtx } from "./_generated/server";
import { authComponent } from "./auth";
import { can, type Permission } from "./permissions";

/** The signed-in person's employee record, or null when signed out, unlinked or disabled. */
export async function getViewer(ctx: QueryCtx) {
  const user = await authComponent.safeGetAuthUser(ctx);
  if (!user) return null;
  const employee = await ctx.db
    .query("employees")
    .withIndex("by_userId", (q) => q.eq("userId", user._id))
    .unique();
  if (!employee || employee.status !== "active") return null;
  return employee;
}

/** Throws unless the caller is signed in as an active employee. */
export async function requireViewer(ctx: QueryCtx) {
  const viewer = await getViewer(ctx);
  if (!viewer) throw new ConvexError("Unauthenticated");
  return viewer;
}

/** Throws unless the caller holds `permission`. */
export async function requirePermission(ctx: QueryCtx, permission: Permission) {
  const viewer = await requireViewer(ctx);
  if (!can(viewer.accessRole, permission)) throw new ConvexError("You don't have access to this.");
  return viewer;
}

/** For queries: the viewer if they hold `permission`, otherwise null (render nothing). */
export async function viewerWith(ctx: QueryCtx, permission: Permission) {
  const viewer = await getViewer(ctx);
  return viewer && can(viewer.accessRole, permission) ? viewer : null;
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
