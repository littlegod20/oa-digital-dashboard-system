import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { getViewer, optional, requireViewer } from "./lib";
import { currency, transactionType } from "./schema";

function toTransaction(t: Doc<"transactions">) {
  return {
    id: t._id,
    type: t.type,
    description: t.description,
    amount: t.amount,
    currency: t.currency,
    person: t.person,
    category: t.category,
    date: t.date,
    orderId: t.orderId,
  };
}

export type TransactionView = ReturnType<typeof toTransaction>;

/** All transactions, newest first. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    if (!(await getViewer(ctx))) return [];
    const rows = await ctx.db.query("transactions").withIndex("by_date").order("desc").collect();
    return rows.map(toTransaction);
  },
});

export const create = mutation({
  args: {
    type: transactionType,
    description: v.string(),
    amount: v.number(),
    currency,
    category: v.string(),
    person: v.optional(v.string()),
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireViewer(ctx);
    return await ctx.db.insert("transactions", {
      type: args.type,
      description: args.description.trim(),
      amount: args.amount,
      currency: args.currency,
      category: args.category,
      person: optional(args.person),
      date: args.date ?? new Date().toISOString().slice(0, 10),
    });
  },
});
