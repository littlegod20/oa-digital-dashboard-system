import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { verifyToken, SESSION_COOKIE, type UserProfile } from "./auth";

export async function validateCredentials(
  email: string,
  password: string
): Promise<UserProfile | null> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;
  return {
    email: user.email,
    role: user.role as "management" | "sales",
    name: user.name,
    initials: user.initials,
  };
}

export async function updatePassword(
  email: string,
  newPassword: string
): Promise<boolean> {
  const hash = await bcrypt.hash(newPassword, 12);
  const result = await db
    .update(users)
    .set({ passwordHash: hash })
    .where(eq(users.email, email.toLowerCase()));
  // drizzle postgres.js returns the updated rows
  return Array.isArray(result) ? result.length > 0 : true;
}

export async function getKnownEmail(email: string): Promise<string | null> {
  const [user] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);
  return user?.email ?? null;
}

export async function getSessionUser(): Promise<UserProfile | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}
