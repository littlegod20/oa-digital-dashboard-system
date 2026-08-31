import { NextRequest, NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { transactions } from "@/lib/db/schema";
import { getSessionUser } from "@/lib/auth-server";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db.select().from(transactions).orderBy(desc(transactions.date));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const today = new Date().toISOString().slice(0, 10);
  const [created] = await db
    .insert(transactions)
    .values({
      id: `tx${Date.now()}`,
      type: body.type ?? "income",
      description: body.description,
      amount: String(body.amount ?? 0),
      currency: body.currency ?? "GHS",
      person: body.person ?? null,
      category: body.category ?? "Other",
      date: body.date ?? today,
      orderId: body.orderId ?? null,
    })
    .returning();
  return NextResponse.json(created, { status: 201 });
}
