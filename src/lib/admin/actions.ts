import "server-only";

import { revalidatePath } from "next/cache";
import type { ZodType } from "zod";

import { connectToDatabase } from "@/lib/db/mongoose";
import { getAdminSession } from "@/lib/auth/session";

export type ActionState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Record<string, string>;
};

export const IDLE_STATE: ActionState = { status: "idle", message: "" };

export function errorState(message: string, fieldErrors?: Record<string, string>): ActionState {
  return { status: "error", message, fieldErrors };
}

export function successState(message: string): ActionState {
  return { status: "success", message };
}

/**
 * Every admin mutation runs through here. Authentication is checked on the
 * server for each call, so a client that hides a button is a convenience, never
 * the control. Route-level protection alone is not relied upon.
 */
export async function withAdmin<T>(
  run: () => Promise<T>,
): Promise<{ ok: true; value: T } | { ok: false; state: ActionState }> {
  const session = await getAdminSession();
  if (!session) {
    return { ok: false, state: errorState("Your session has expired. Please sign in again.") };
  }

  try {
    await connectToDatabase();
    return { ok: true, value: await run() };
  } catch (error) {
    console.error("[usagwp] admin action failed", error);

    // Surface the one database error that is genuinely actionable for an editor.
    const message =
      error instanceof Error && error.message.includes("E11000")
        ? "That value is already in use. Try a different slug or email."
        : "The change could not be saved. Please try again.";
    return { ok: false, state: errorState(message) };
  }
}

/** Parses a FormData submission with a Zod schema into a flat field error map. */
export function parseForm<S extends ZodType>(
  schema: S,
  data: Record<string, unknown>,
):
  | { ok: true; value: import("zod").infer<S> }
  | { ok: false; state: ActionState } {
  const parsed = schema.safeParse(data);
  if (parsed.success) return { ok: true, value: parsed.data };

  const fieldErrors: Record<string, string> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path.join(".");
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return {
    ok: false,
    state: errorState("Please check the highlighted fields.", fieldErrors),
  };
}

/** Reads a checkbox that may be absent from the payload entirely. */
export function readBoolean(form: FormData, name: string): boolean {
  const value = form.get(name);
  return value === "on" || value === "true" || value === "1";
}

export function readString(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === "string" ? value : "";
}

/** Reads the repeated label/url pairs used for social links and retailers. */
export function readLinkList(form: FormData, name: string): { label: string; url: string }[] {
  const labels = form.getAll(`${name}.label`).map(String);
  const urls = form.getAll(`${name}.url`).map(String);
  const out: { label: string; url: string }[] = [];
  for (let index = 0; index < Math.max(labels.length, urls.length); index += 1) {
    const label = (labels[index] ?? "").trim();
    const url = (urls[index] ?? "").trim();
    if (label && url) out.push({ label, url });
  }
  return out;
}

/**
 * Public pages are statically rendered with a revalidation window. Admin writes
 * push the affected routes immediately so an editor sees their change live.
 */
export function revalidatePublic(paths: string[] = []): void {
  const always = ["/", "/book"];
  for (const path of new Set([...always, ...paths])) {
    try {
      revalidatePath(path);
    } catch (error) {
      console.error("[usagwp] revalidate failed", path, error);
    }
  }
}
