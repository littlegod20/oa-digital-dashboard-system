import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { insertCredentialUserImpl } from "./users";
import { currency, phase, role, transactionType } from "./schema";

/**
 * One-off import of the old Postgres data (see scripts/migrate-postgres-to-convex.mjs).
 *
 * It is a public mutation so the local script can call it, guarded by the
 * MIGRATION_SECRET deployment env var. Unset that variable once the import is done
 * and this function rejects every call. Rows are upserted by their old Postgres
 * id, so re-running the import does not create duplicates.
 */
export const importBatch = mutation({
  args: {
    secret: v.string(),
    users: v.array(
      v.object({ email: v.string(), name: v.string(), role, passwordHash: v.string(), createdAt: v.number() }),
    ),
    deals: v.array(
      v.object({
        legacyId: v.string(),
        client: v.string(),
        title: v.string(),
        value: v.number(),
        currency,
        phase,
        assignee: v.string(),
        paid: v.number(),
        nextAction: v.string(),
        notes: v.string(),
        createdAt: v.number(),
        updatedAt: v.number(),
      }),
    ),
    transactions: v.array(
      v.object({
        legacyId: v.string(),
        type: transactionType,
        description: v.string(),
        amount: v.number(),
        currency,
        person: v.optional(v.string()),
        category: v.string(),
        date: v.string(),
        orderId: v.optional(v.string()),
      }),
    ),
    contacts: v.array(
      v.object({
        legacyId: v.string(),
        name: v.string(),
        company: v.optional(v.string()),
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
        notes: v.optional(v.string()),
        tags: v.array(v.string()),
        createdAt: v.number(),
      }),
    ),
    teamMembers: v.array(
      v.object({
        legacyId: v.string(),
        name: v.string(),
        role: v.string(),
        email: v.string(),
        phone: v.optional(v.string()),
        avatar: v.optional(v.string()),
        activeDeals: v.number(),
        totalRevenue: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const expected = process.env.MIGRATION_SECRET;
    if (!expected || args.secret !== expected) throw new ConvexError("Migration is disabled");

    for (const u of args.users) await insertCredentialUserImpl(ctx, u);

    const counts = { users: args.users.length, deals: 0, transactions: 0, contacts: 0, teamMembers: 0 };

    for (const row of args.deals) {
      const existing = await ctx.db.query("deals").withIndex("by_legacyId", (q) => q.eq("legacyId", row.legacyId)).unique();
      if (existing) await ctx.db.replace(existing._id, row);
      else await ctx.db.insert("deals", row);
      counts.deals++;
    }
    for (const row of args.transactions) {
      const existing = await ctx.db.query("transactions").withIndex("by_legacyId", (q) => q.eq("legacyId", row.legacyId)).unique();
      if (existing) await ctx.db.replace(existing._id, row);
      else await ctx.db.insert("transactions", row);
      counts.transactions++;
    }
    for (const row of args.contacts) {
      const existing = await ctx.db.query("contacts").withIndex("by_legacyId", (q) => q.eq("legacyId", row.legacyId)).unique();
      if (existing) await ctx.db.replace(existing._id, row);
      else await ctx.db.insert("contacts", row);
      counts.contacts++;
    }
    for (const row of args.teamMembers) {
      const existing = await ctx.db.query("teamMembers").withIndex("by_legacyId", (q) => q.eq("legacyId", row.legacyId)).unique();
      if (existing) await ctx.db.replace(existing._id, row);
      else await ctx.db.insert("teamMembers", row);
      counts.teamMembers++;
    }
    return counts;
  },
});
