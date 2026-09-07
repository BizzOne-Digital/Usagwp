import "server-only";

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

import { connectToDatabase } from "@/lib/db/mongoose";
import { AdminUser } from "@/models";

export const SESSION_COOKIE = "usagwp_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

export type AdminSession = {
  userId: string;
  email: string;
  name: string;
  role: "owner" | "editor";
};

function getSecret(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "ADMIN_SESSION_SECRET must be set to a random string of at least 32 characters.",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(
  session: AdminSession,
  tokenVersion: number,
): Promise<string> {
  return new SignJWT({ ...session, tokenVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("usagwp")
    .setAudience("usagwp-admin")
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecret());
}

export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

/**
 * Verifies the signed cookie AND re-checks the user against the database, so a
 * deleted admin or a password change immediately invalidates live sessions.
 * Every mutating route handler and every admin page goes through this.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: "usagwp",
      audience: "usagwp-admin",
    });

    const userId = String(payload.userId ?? "");
    if (!userId) return null;

    await connectToDatabase();
    const user = await AdminUser.findById(userId).select("email name role tokenVersion").lean();
    if (!user) return null;
    if ((user.tokenVersion ?? 0) !== Number(payload.tokenVersion ?? -1)) return null;

    return {
      userId,
      email: user.email,
      name: user.name ?? "",
      role: (user.role as AdminSession["role"]) ?? "editor",
    };
  } catch {
    return null;
  }
}

export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) throw new UnauthorizedError();
  return session;
}

export class UnauthorizedError extends Error {
  constructor(message = "Authentication required.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}
