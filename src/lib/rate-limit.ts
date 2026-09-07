import "server-only";

/**
 * In-memory sliding window, keyed by client IP and bucket name.
 *
 * This protects a single warm instance against a burst from one address, which
 * is what the public forms actually need. It is intentionally not a distributed
 * limiter: on a serverless host each instance keeps its own counters, and they
 * reset on cold start. If the site ever needs a hard global limit, move this to
 * a shared store. See README "Rate limiting".
 */

type Bucket = { count: number; resetAt: number };

declare global {
  var __usagwpRateLimit: Map<string, Bucket> | undefined;
}

const buckets = globalThis.__usagwpRateLimit ?? new Map<string, Bucket>();
globalThis.__usagwpRateLimit = buckets;

function clientKey(request: Request, bucket: string): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  return `${bucket}:${ip}`;
}

export function checkRateLimit(
  request: Request,
  bucket: string,
  options: { max: number; windowMs: number },
): { ok: true } | { ok: false; retryAfterSeconds: number } {
  const key = clientKey(request, bucket);
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });

    // Opportunistic cleanup so the map cannot grow without bound.
    if (buckets.size > 5000) {
      for (const [entryKey, entry] of buckets) {
        if (entry.resetAt <= now) buckets.delete(entryKey);
      }
    }
    return { ok: true };
  }

  if (existing.count >= options.max) {
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return { ok: true };
}
