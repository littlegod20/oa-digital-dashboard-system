import { SignJWT, jwtVerify } from "jose";

export type Role = "management" | "sales";

export interface UserProfile {
  email: string;
  role: Role;
  name: string;
  initials: string;
}

export const SESSION_COOKIE = "oa-session";

function getSecret() {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET ?? "oa-digital-dashboard-secret-key-2025"
  );
}

export async function signToken(payload: UserProfile): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<UserProfile | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      email: payload.email as string,
      role: payload.role as Role,
      name: payload.name as string,
      initials: payload.initials as string,
    };
  } catch {
    return null;
  }
}

export async function signResetToken(email: string): Promise<string> {
  return new SignJWT({ email, purpose: "reset" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(getSecret());
}

export async function verifyResetToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.purpose !== "reset") return null;
    return payload.email as string;
  } catch {
    return null;
  }
}
