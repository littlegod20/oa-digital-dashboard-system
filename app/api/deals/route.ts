import { NextRequest, NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { deals } from "@/lib/db/schema";
import { getSessionUser } from "@/lib/auth-server";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db.select().from(deals).orderBy(desc(deals.updatedAt));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const [created] = await db
    .insert(deals)
    .values({
      id: `d${Date.now()}`,
      client: body.client ?? body.clientName,
      title: body.title ?? body.dealTitle,
      value: String(body.value ?? 0),
      currency: body.currency ?? "GHS",
      phase: body.phase ?? "lead",
      assignee: body.assignee ?? "",
      paid: String(body.paid ?? 0),
      nextAction: body.nextAction ?? "",
      notes: body.notes ?? "",
    })
    .returning();
  return NextResponse.json(created, { status: 201 });
}
