import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { deals } from "@/lib/db/schema";
import { getSessionUser } from "@/lib/auth-server";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json();
  const [updated] = await db
    .update(deals)
    .set({
      client: body.client,
      title: body.title,
      value: String(body.value ?? 0),
      currency: body.currency ?? "GHS",
      phase: body.phase ?? "lead",
      assignee: body.assignee ?? "",
      paid: String(body.paid ?? 0),
      nextAction: body.nextAction ?? "",
      notes: body.notes ?? "",
      updatedAt: new Date(),
    })
    .where(eq(deals.id, id))
    .returning();
  if (!updated) return NextResponse.json({ error: "Deal not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const [deleted] = await db.delete(deals).where(eq(deals.id, id)).returning();
  if (!deleted) return NextResponse.json({ error: "Deal not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
