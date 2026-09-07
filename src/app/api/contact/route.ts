import { NextResponse } from "next/server";

import { connectToDatabase, isDatabaseConfigured } from "@/lib/db/mongoose";
import { checkRateLimit } from "@/lib/rate-limit";
import { contactSchema } from "@/lib/validation/schemas";
import { ContactMessage } from "@/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const limit = checkRateLimit(request, "contact", { max: 5, windowMs: 10 * 60 * 1000 });
  if (!limit.ok) {
    return NextResponse.json(
      { success: false, error: "Too many messages sent. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 });
  }

  // Client-side validation is a convenience only. This is the real check.
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "");
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return NextResponse.json(
      { success: false, error: "Please check the highlighted fields.", fieldErrors },
      { status: 400 },
    );
  }

  // Honeypot filled means a bot. Report success so it learns nothing.
  if (parsed.data.website) {
    return NextResponse.json({ success: true });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        success: false,
        error: "Messages cannot be received right now. Please email us directly.",
      },
      { status: 503 },
    );
  }

  try {
    await connectToDatabase();
    await ContactMessage.create({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      subject: parsed.data.subject,
      message: parsed.data.message,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[usagwp] contact submission failed", error);
    return NextResponse.json(
      {
        success: false,
        error: "Your message could not be saved. Please email us directly.",
      },
      { status: 500 },
    );
  }
}
