import { v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { requirePermission, viewerWith } from "./lib";
import { currency, phase } from "./schema";

const dealFields = {
  client: v.string(),
  title: v.string(),
  value: v.number(),
  currency,
  phase,
  ownerId: v.optional(v.id("employees")),
  paid: v.number(),
  nextAction: v.string(),
  notes: v.string(),
};

async function ownerName(ctx: QueryCtx, ownerId: Id<"employees"> | undefined) {
  return ownerId ? ((await ctx.db.get(ownerId))?.name ?? "") : "";
}

function toDeal(d: Doc<"deals">) {
  return {
    id: d._id,
    client: d.client,
    title: d.title,
    value: d.value,
    currency: d.currency,
    phase: d.phase,
    assignee: d.assignee,
    ownerId: d.ownerId ?? null,
    paid: d.paid,
    nextAction: d.nextAction,
    notes: d.notes,
    createdAt: new Date(d.createdAt).toISOString(),
    updatedAt: new Date(d.updatedAt).toISOString(),
  };
}

export type DealView = ReturnType<typeof toDeal>;

/** All deals, most recently updated first. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    if (!(await viewerWith(ctx, "pipeline.view"))) return [];
    const rows = await ctx.db.query("deals").withIndex("by_updatedAt").order("desc").collect();
    return rows.map(toDeal);
  },
});

export const create = mutation({
  args: dealFields,
  handler: async (ctx, args) => {
    await requirePermission(ctx, "pipeline.view");
    const now = Date.now();
    return await ctx.db.insert("deals", { ...args, assignee: await ownerName(ctx, args.ownerId), createdAt: now, updatedAt: now });
  },
});

export const update = mutation({
  args: { id: v.id("deals"), ...dealFields },
  handler: async (ctx, { id, ...fields }) => {
    await requirePermission(ctx, "pipeline.view");
    await ctx.db.patch(id, { ...fields, assignee: await ownerName(ctx, fields.ownerId), updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("deals") },
  handler: async (ctx, { id }) => {
    await requirePermission(ctx, "pipeline.view");
    await ctx.db.delete(id);
  },
});
