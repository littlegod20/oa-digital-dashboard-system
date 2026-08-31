import { NextRequest, NextResponse } from "next/server";
import { signResetToken } from "@/lib/auth";
import { getKnownEmail } from "@/lib/auth-server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    const knownEmail = await getKnownEmail(email);
    if (!knownEmail) {
      // Don't reveal whether the email exists
      return NextResponse.json({ ok: true });
    }
    const token = await signResetToken(knownEmail);
    const baseUrl = req.nextUrl.origin;
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;
    // TODO: send resetUrl via email in production
    return NextResponse.json({ ok: true, resetUrl });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
