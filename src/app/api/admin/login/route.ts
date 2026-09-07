import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { connectToDatabase, isDatabaseConfigured } from "@/lib/db/mongoose";
import { checkRateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation/schemas";
import { AdminUser } from "@/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// One message for every failure mode, so the endpoint never reveals which
// addresses have accounts.
const GENERIC_FAILURE = "Those details were not recognised.";

export async function POST(request: Request) {
  const limit = checkRateLimit(request, "admin-login", { max: 8, windowMs: 15 * 60 * 1000 });
  if (!limit.ok) {
    return NextResponse.json(
      { success: false, error: "Too many attempts. Please wait and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { success: false, error: "The admin area is not configured." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: GENERIC_FAILURE }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: GENERIC_FAILURE }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const user = await AdminUser.findOne({ email: parsed.data.email.toLowerCase() });

    if (!user) {
      // Spend comparable time either way so the response does not leak whether
      // the address exists.
      await bcrypt.compare(parsed.data.password, "$2b$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv");
      return NextResponse.json({ success: false, error: GENERIC_FAILURE }, { status: 401 });
    }

    const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ success: false, error: GENERIC_FAILURE }, { status: 401 });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = await createSessionToken(
      {
        userId: String(user._id),
        email: user.email,
        name: user.name ?? "",
        role: (user.role as "owner" | "editor") ?? "editor",
      },
      user.tokenVersion ?? 0,
    );
    await setSessionCookie(token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[usagwp] admin login failed", error);
    return NextResponse.json(
      { success: false, error: "Sign in is unavailable right now." },
      { status: 500 },
    );
  }
}
