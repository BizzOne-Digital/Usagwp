import { NextResponse } from "next/server";

import { connectToDatabase, isDatabaseConfigured } from "@/lib/db/mongoose";
import { checkRateLimit } from "@/lib/rate-limit";
import { subscribeSchema } from "@/lib/validation/schemas";
import { Subscriber } from "@/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const limit = checkRateLimit(request, "subscribe", { max: 8, windowMs: 10 * 60 * 1000 });
  if (!limit.ok) {
    return NextResponse.json(
      { success: false, error: "Too many attempts. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 });
  }

  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Enter a valid email address." },
      { status: 400 },
    );
  }

  if (parsed.data.website) {
    return NextResponse.json({ success: true, message: "You are on the list." });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        success: false,
        error: "The list is not accepting sign-ups right now. Please email us instead.",
      },
      { status: 503 },
    );
  }

  try {
    await connectToDatabase();

    /**
     * Subscribers are stored here only. No email provider is configured, so the
     * site never claims a confirmation message has been sent. Wiring a provider
     * later is a change to this handler alone.
     */
    await Subscriber.updateOne(
      { email: parsed.data.email },
      {
        $setOnInsert: {
          email: parsed.data.email,
          source: "site",
        },
        $set: parsed.data.firstName ? { firstName: parsed.data.firstName } : {},
      },
      { upsert: true },
    );

    return NextResponse.json({ success: true, message: "You are on the list." });
  } catch (error) {
    console.error("[usagwp] subscribe failed", error);
    return NextResponse.json(
      { success: false, error: "We could not add you just now. Please try again." },
      { status: 500 },
    );
  }
}
