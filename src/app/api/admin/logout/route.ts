import { NextResponse } from "next/server";

import { clearSessionCookie } from "@/lib/auth/session";
import { getSiteUrl } from "@/lib/seo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  await clearSessionCookie();

  // Redirect back to the login page. The target is derived from our own
  // configuration, never from a request parameter, so this cannot be used as an
  // open redirect.
  const base = new URL(request.url).origin || getSiteUrl();
  return NextResponse.redirect(new URL("/admin/login", base), { status: 303 });
}
