import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { getViewer, optional, requireViewer } from "./lib";

function toMember(m: Doc<"teamMembers">) {
  return {
    id: m._id,
    name: m.name,
    role: m.role,
    email: m.email,
    phone: m.phone,
    avatar: m.avatar,
    activeDeals: m.activeDeals,
    totalRevenue: m.totalRevenue,
  };
}

export type MemberView = ReturnType<typeof toMember>;

const memberFields = {
  name: v.string(),
  role: v.string(),
  email: v.string(),
  phone: v.optional(v.string()),
};

/** All team members, alphabetical. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    if (!(await getViewer(ctx))) return [];
    const rows = await ctx.db.query("teamMembers").withIndex("by_name").collect();
    return rows.map(toMember);
  },
});

export const create = mutation({
  args: memberFields,
  handler: async (ctx, args) => {
    await requireViewer(ctx);
    return await ctx.db.insert("teamMembers", {
      name: args.name.trim(),
      role: args.role.trim(),
      email: args.email.trim(),
      phone: optional(args.phone),
      activeDeals: 0,
      totalRevenue: 0,
    });
  },
});

export const update = mutation({
  args: { id: v.id("teamMembers"), ...memberFields },
  handler: async (ctx, { id, ...args }) => {
    await requireViewer(ctx);
    await ctx.db.patch(id, {
      name: args.name.trim(),
      role: args.role.trim(),
      email: args.email.trim(),
      phone: optional(args.phone),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("teamMembers") },
  handler: async (ctx, { id }) => {
    await requireViewer(ctx);
    await ctx.db.delete(id);
  },
});
