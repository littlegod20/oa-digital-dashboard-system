/**
 * One-off: copy every row from the old Postgres database into Convex.
 *
 *   1. npx convex env set MIGRATION_SECRET <random-string>
 *   2. MIGRATION_SECRET=<same-string> node scripts/migrate-postgres-to-convex.mjs
 *   3. npx convex env remove MIGRATION_SECRET
 *
 * Reads DATABASE_URL and NEXT_PUBLIC_CONVEX_URL from .env / .env.local.
 * Postgres is only read, never modified. Safe to re-run (rows upsert by old id).
 */
import { config } from "dotenv";
import postgres from "postgres";
import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";

config({ path: ".env", quiet: true });
config({ path: ".env.local", override: true, quiet: true });

const { DATABASE_URL, NEXT_PUBLIC_CONVEX_URL, MIGRATION_SECRET } = process.env;
if (!DATABASE_URL || !NEXT_PUBLIC_CONVEX_URL || !MIGRATION_SECRET) {
  console.error("DATABASE_URL, NEXT_PUBLIC_CONVEX_URL and MIGRATION_SECRET must all be set.");
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { ssl: "require", max: 1 });

const num = (v) => Number(v ?? 0);
const ms = (v) => (v ? new Date(v).getTime() : Date.now());
const opt = (v) => (v === null || v === undefined || String(v).trim() === "" ? undefined : String(v));
const lower = (v) => String(v).trim().toLowerCase();

function oneOf(value, allowed, fallback, label) {
  const v = lower(value);
  if (allowed.includes(v)) return v;
  console.warn(`  ! ${label}: unexpected value "${value}", using "${fallback}"`);
  return fallback;
}

const users = (await sql`select * from users`).map((u) => ({
  email: lower(u.email),
  name: u.name,
  role: oneOf(u.role, ["management", "sales"], "sales", `user ${u.email} role`),
  passwordHash: u.password_hash,
  createdAt: ms(u.created_at),
}));

const deals = (await sql`select * from deals`).map((d) => ({
  legacyId: d.id,
  client: d.client,
  title: d.title,
  value: num(d.value),
  currency: oneOf(d.currency, ["ghs", "usd"], "ghs", `deal ${d.id} currency`).toUpperCase(),
  phase: oneOf(d.phase, ["lead", "proposal", "await", "meet", "action", "progress", "done", "hold"], "lead", `deal ${d.id} phase`),
  assignee: d.assignee ?? "",
  paid: num(d.paid),
  nextAction: d.next_action ?? "",
  notes: d.notes ?? "",
  createdAt: ms(d.created_at),
  updatedAt: ms(d.updated_at),
}));

const transactions = (await sql`select id, type, description, amount, currency, person, category, date::text as date, order_id from transactions`).map((t) => ({
  legacyId: t.id,
  // The old add-transaction form saved "Expense"/"Income"; normalise to the lowercase enum.
  type: oneOf(t.type, ["income", "expense", "transfer", "payment_received"], "expense", `transaction ${t.id} type`),
  description: t.description,
  amount: num(t.amount),
  currency: oneOf(t.currency, ["ghs", "usd"], "ghs", `transaction ${t.id} currency`).toUpperCase(),
  person: opt(t.person),
  category: t.category,
  date: t.date,
  orderId: opt(t.order_id),
}));

const contacts = (await sql`select * from contacts`).map((c) => ({
  legacyId: c.id,
  name: c.name,
  company: opt(c.company),
  email: opt(c.email),
  phone: opt(c.phone),
  notes: opt(c.notes),
  tags: c.tags ?? [],
  createdAt: ms(c.created_at),
}));

const teamMembers = (await sql`select * from team_members`).map((m) => ({
  legacyId: m.id,
  name: m.name,
  role: m.role,
  email: m.email,
  phone: opt(m.phone),
  avatar: opt(m.avatar),
  activeDeals: num(m.active_deals),
  totalRevenue: num(m.total_revenue),
}));

await sql.end();

console.log(
  `Read from Postgres: ${users.length} users, ${deals.length} deals, ${transactions.length} transactions, ` +
    `${contacts.length} contacts, ${teamMembers.length} team members`,
);

const client = new ConvexHttpClient(NEXT_PUBLIC_CONVEX_URL);
const result = await client.mutation(anyApi.migrations.importBatch, {
  secret: MIGRATION_SECRET,
  users,
  deals,
  transactions,
  contacts,
  teamMembers,
});
console.log("Written to Convex:", result);
