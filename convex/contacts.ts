import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { getViewer, optional, requireViewer } from "./lib";

function toContact(c: Doc<"contacts">) {
  return {
    id: c._id,
    name: c.name,
    company: c.company,
    email: c.email,
    phone: c.phone,
    notes: c.notes,
    tags: c.tags,
    createdAt: new Date(c.createdAt).toISOString(),
  };
}

export type ContactView = ReturnType<typeof toContact>;

/** All contacts, alphabetical. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    if (!(await getViewer(ctx))) return [];
    const rows = await ctx.db.query("contacts").withIndex("by_name").collect();
    return rows.map(toContact);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    company: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await requireViewer(ctx);
    return await ctx.db.insert("contacts", {
      name: args.name.trim(),
      company: optional(args.company),
      email: optional(args.email),
      phone: optional(args.phone),
      notes: optional(args.notes),
      tags: args.tags.map((t) => t.trim()).filter(Boolean),
      createdAt: Date.now(),
    });
  },
});
