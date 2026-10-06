import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { getViewer, requireViewer } from "./lib";
import { currency, phase } from "./schema";

const dealFields = {
  client: v.string(),
  title: v.string(),
  value: v.number(),
  currency,
  phase,
  assignee: v.string(),
  paid: v.number(),
  nextAction: v.string(),
  notes: v.string(),
};

function toDeal(d: Doc<"deals">) {
  return {
    id: d._id,
    client: d.client,
    title: d.title,
    value: d.value,
    currency: d.currency,
    phase: d.phase,
    assignee: d.assignee,
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
    if (!(await getViewer(ctx))) return [];
    const rows = await ctx.db.query("deals").withIndex("by_updatedAt").order("desc").collect();
    return rows.map(toDeal);
  },
});

export const create = mutation({
  args: dealFields,
  handler: async (ctx, args) => {
    await requireViewer(ctx);
    const now = Date.now();
    return await ctx.db.insert("deals", { ...args, createdAt: now, updatedAt: now });
  },
});

export const update = mutation({
  args: { id: v.id("deals"), ...dealFields },
  handler: async (ctx, { id, ...fields }) => {
    await requireViewer(ctx);
    await ctx.db.patch(id, { ...fields, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("deals") },
  handler: async (ctx, { id }) => {
    await requireViewer(ctx);
    await ctx.db.delete(id);
  },
});
