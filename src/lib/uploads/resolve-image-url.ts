/**
 * Single entry point for turning a stored image reference into something safe to
 * render. Handles the four shapes that exist in the wild:
 *
 *   1. /api/uploads/<folder>/<file>  current storage, served from MongoDB
 *   2. https://...                   external / retailer artwork
 *   3. /uploads/...                  legacy disk paths that no longer resolve
 *      on a serverless host, so they fall back to the placeholder
 *   4. null / "" / whitespace        no image set
 */
export const IMAGE_PLACEHOLDER = "";

export function resolveImageUrl(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const url = value.trim();
  if (!url) return null;

  if (url.startsWith("/api/uploads/")) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/brand/")) return url;

  // Legacy filesystem paths cannot be served from a serverless deployment.
  if (url.startsWith("/uploads/")) return null;

  return null;
}

export function hasImage(value: string | null | undefined): boolean {
  return resolveImageUrl(value) !== null;
}
