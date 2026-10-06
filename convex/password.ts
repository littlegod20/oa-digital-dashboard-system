import bcrypt from "bcryptjs";

// Convex's runtime has Web Crypto on globalThis but no `self`, which bcryptjs looks for.
bcrypt.setRandomFallback((len) => Array.from(globalThis.crypto.getRandomValues(new Uint8Array(len))));

// Cost 12 matches the hashes imported from the old Postgres database.
export const hashPassword = (password: string) => bcrypt.hash(password, 12);

export const verifyPassword = (password: string, hash: string) => bcrypt.compare(password, hash);
