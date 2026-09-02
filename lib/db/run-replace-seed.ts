/**
 * Loads DATABASE_URL from .env / .env.local and runs lib/db/replace-seed.sql
 *
 *   npm run db:replace-seed
 */
import { config } from "dotenv";
import { readFileSync } from "fs";
import postgres from "postgres";

config({ path: ".env" });
config({ path: ".env.local", override: true });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local — do not run psql without exporting that variable."
    );
  }
  const sql = postgres(url, { ssl: "require", max: 1 });
  const text = readFileSync("lib/db/replace-seed.sql", "utf8");
  await sql.unsafe(text);
  const rows = await sql.unsafe(`
    select
      (select count(*)::int from deals) as deals,
      (select count(*)::int from transactions) as tx,
      (select count(*)::int from contacts) as contacts,
      (select count(*)::int from team_members) as team
  `);
  console.log("Seed replaced:", JSON.stringify(rows[0]));
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
