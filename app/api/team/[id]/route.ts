import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { teamMembers } from "@/lib/db/schema";
import { getSessionUser } from "@/lib/auth-server";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json();
  const [updated] = await db
    .update(teamMembers)
    .set({
      name: body.name,
      role: body.role,
      email: body.email,
      phone: body.phone ?? null,
      avatar: body.avatar ?? null,
    })
    .where(eq(teamMembers.id, id))
    .returning();
  if (!updated) return NextResponse.json({ error: "Member not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const [deleted] = await db.delete(teamMembers).where(eq(teamMembers.id, id)).returning();
  if (!deleted) return NextResponse.json({ error: "Member not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
