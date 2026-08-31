import {
  pgTable,
  text,
  numeric,
  integer,
  timestamp,
  date,
  uuid,
  boolean,
} from "drizzle-orm/pg-core";

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: ["management", "sales"] }).notNull(),
  initials: text("initials").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ─── Deals ────────────────────────────────────────────────────────────────────

export const deals = pgTable("deals", {
  id: text("id").primaryKey(),
  client: text("client").notNull(),
  title: text("title").notNull(),
  value: numeric("value", { precision: 14, scale: 2 }).notNull(),
  currency: text("currency", { enum: ["GHS", "USD"] }).notNull().default("GHS"),
  phase: text("phase", {
    enum: ["lead", "proposal", "await", "meet", "action", "progress", "done", "hold"],
  }).notNull(),
  assignee: text("assignee").notNull().default(""),
  paid: numeric("paid", { precision: 14, scale: 2 }).notNull().default("0"),
  nextAction: text("next_action").notNull().default(""),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ─── Transactions ─────────────────────────────────────────────────────────────

export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  type: text("type", {
    enum: ["income", "expense", "transfer", "payment_received"],
  }).notNull(),
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  currency: text("currency", { enum: ["GHS", "USD"] }).notNull().default("GHS"),
  person: text("person"),
  category: text("category").notNull(),
  date: date("date").notNull(),
  orderId: text("order_id"),
});

// ─── Contacts ─────────────────────────────────────────────────────────────────

export const contacts = pgTable("contacts", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company"),
  email: text("email"),
  phone: text("phone"),
  notes: text("notes"),
  tags: text("tags").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ─── Team members ─────────────────────────────────────────────────────────────

export const teamMembers = pgTable("team_members", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  avatar: text("avatar"),
  activeDeals: integer("active_deals").notNull().default(0),
  totalRevenue: numeric("total_revenue", { precision: 14, scale: 2 }).notNull().default("0"),
});

// ─── Type exports ─────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Deal = typeof deals.$inferSelect;
export type NewDeal = typeof deals.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
