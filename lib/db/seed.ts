/**
 * Run with:  npx tsx lib/db/seed.ts
 *
 * Seeds the database with the two default users (hashed passwords)
 * and all mock data from lib/mock-data.ts.
 */
import { config } from "dotenv";

config({ path: ".env" });
config({ path: ".env.local", override: true });
import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { DEALS, TRANSACTIONS, CONTACTS, TEAM } from "../mock-data";

async function main() {
  const client = postgres(process.env.DATABASE_URL!, { ssl: "require", max: 1 });
  const db = drizzle(client, { schema });

  console.log("Seeding users...");
  const mgmtHash = await bcrypt.hash(process.env.AUTH_MGMT_PASS ?? "Oa@Mgmt2025", 12);
  const salesHash = await bcrypt.hash(process.env.AUTH_SALES_PASS ?? "Oa@Sales2025", 12);

  await db
    .insert(schema.users)
    .values([
      {
        email: "info@oadigismartsecurity.com",
        passwordHash: mgmtHash,
        name: "Management",
        role: "management",
        initials: "MG",
      },
      {
        email: "sales@oadigismartsecurity.com",
        passwordHash: salesHash,
        name: "Sales Team",
        role: "sales",
        initials: "ST",
      },
    ])
    .onConflictDoNothing();

  console.log("Seeding deals...");
  await db
    .insert(schema.deals)
    .values(
      DEALS.map((d) => ({
        id: d.id,
        client: d.client,
        title: d.title,
        value: String(d.value),
        currency: d.currency,
        phase: d.phase,
        assignee: d.assignee,
        paid: String(d.paid),
        nextAction: d.nextAction,
        notes: d.notes,
        createdAt: new Date(d.createdAt),
        updatedAt: new Date(d.updatedAt),
      }))
    )
    .onConflictDoNothing();

  console.log("Seeding transactions...");
  await db
    .insert(schema.transactions)
    .values(
      TRANSACTIONS.map((t) => ({
        id: t.id,
        type: t.type,
        description: t.description,
        amount: String(t.amount),
        currency: t.currency,
        person: t.person,
        category: t.category,
        date: t.date,
        orderId: t.orderId,
      }))
    )
    .onConflictDoNothing();

  console.log("Seeding contacts...");
  await db
    .insert(schema.contacts)
    .values(
      CONTACTS.map((c) => ({
        id: c.id,
        name: c.name,
        company: c.company,
        email: c.email,
        phone: c.phone,
        notes: c.notes,
        tags: c.tags,
        createdAt: new Date(c.createdAt),
      }))
    )
    .onConflictDoNothing();

  console.log("Seeding team members...");
  await db
    .insert(schema.teamMembers)
    .values(
      TEAM.map((m) => ({
        id: m.id,
        name: m.name,
        role: m.role,
        email: m.email,
        phone: m.phone,
        avatar: m.avatar,
        activeDeals: m.activeDeals,
        totalRevenue: String(m.totalRevenue),
      }))
    )
    .onConflictDoNothing();

  console.log("Done! All seed data inserted.");
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
