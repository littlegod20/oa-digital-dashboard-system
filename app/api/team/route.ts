import { NextRequest, NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { teamMembers } from "@/lib/db/schema";
import { getSessionUser } from "@/lib/auth-server";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db.select().from(teamMembers).orderBy(asc(teamMembers.name));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const [created] = await db
    .insert(teamMembers)
    .values({
      id: `tm${Date.now()}`,
      name: body.name,
      role: body.role,
      email: body.email,
      phone: body.phone ?? null,
      avatar: body.avatar ?? null,
      activeDeals: 0,
      totalRevenue: "0",
    })
    .returning();
  return NextResponse.json(created, { status: 201 });
}
