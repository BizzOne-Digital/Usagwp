import { NextResponse } from "next/server";

import { connectToDatabase, isDatabaseConfigured } from "@/lib/db/mongoose";
import { sendOwnerNotification } from "@/lib/email/mailer";
import { subscriberNotification } from "@/lib/email/templates";
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
     * The upsert is what keeps the list free of duplicates, and its result is
     * also how we know whether this was a new person: `upsertedCount` is 1 only
     * on insert. Re-submitting an existing address therefore updates nothing
     * and sends no second notification.
     */
    const result = await Subscriber.updateOne(
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

    // Saved first, notified second: a refused SMTP connection must never cost
     // us the subscriber, who is already in the admin list by this point.
    if (result.upsertedCount > 0) {
      await sendOwnerNotification(
        subscriberNotification({
          email: parsed.data.email,
          firstName: parsed.data.firstName,
        }),
      );
    }

    return NextResponse.json({ success: true, message: "You are on the list." });
  } catch (error) {
    console.error("[usagwp] subscribe failed", error);
    return NextResponse.json(
      { success: false, error: "We could not add you just now. Please try again." },
      { status: 500 },
    );
  }
}
