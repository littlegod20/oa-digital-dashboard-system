import { NextRequest, NextResponse } from "next/server";
import { verifyResetToken } from "@/lib/auth";
import { updatePassword } from "@/lib/auth-server";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    const email = await verifyResetToken(token);
    if (!email) {
      return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
    }
    const updated = await updatePassword(email, password);
    if (!updated) {
      return NextResponse.json({ error: "Could not update password" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
