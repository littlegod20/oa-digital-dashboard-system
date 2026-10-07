import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const currency = v.union(v.literal("GHS"), v.literal("USD"));

export const phase = v.union(
  v.literal("lead"),
  v.literal("proposal"),
  v.literal("await"),
  v.literal("meet"),
  v.literal("action"),
  v.literal("progress"),
  v.literal("done"),
  v.literal("hold"),
);

export const transactionType = v.union(
  v.literal("income"),
  v.literal("expense"),
  v.literal("transfer"),
  v.literal("payment_received"),
);

export const role = v.union(v.literal("management"), v.literal("sales"));

export default defineSchema({
  // App-side profile for each Better Auth user (credentials live in the betterAuth component).
  profiles: defineTable({
    userId: v.string(),
    email: v.string(),
    name: v.string(),
    role,
    initials: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_email", ["email"]),

  deals: defineTable({
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
  })
    .index("by_updatedAt", ["updatedAt"]),

  transactions: defineTable({
    type: transactionType,
    description: v.string(),
    amount: v.number(),
    currency,
    person: v.optional(v.string()),
    category: v.string(),
    date: v.string(), // YYYY-MM-DD
    orderId: v.optional(v.string()),
  })
    .index("by_date", ["date"]),

  contacts: defineTable({
    name: v.string(),
    company: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
    tags: v.array(v.string()),
    createdAt: v.number(),
  })
    .index("by_name", ["name"]),

  teamMembers: defineTable({
    name: v.string(),
    role: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    avatar: v.optional(v.string()),
    activeDeals: v.number(),
    totalRevenue: v.number(),
  })
    .index("by_name", ["name"]),
});
