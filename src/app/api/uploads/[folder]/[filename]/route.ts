import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db/mongoose";
import { isUploadFolder, sanitizeFilename } from "@/lib/uploads/storage";
import { StoredUpload } from "@/models";

// Streaming binary out of MongoDB requires the Node runtime.
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ folder: string; filename: string }> };

/**
 * A lean() read returns the driver's Binary wrapper rather than a Node Buffer,
 * and Buffer.from() on that wrapper silently yields zero bytes. Every shape the
 * driver can hand back is normalised here.
 */
function toBuffer(value: unknown): Buffer | null {
  if (Buffer.isBuffer(value)) return value;

  if (value instanceof Uint8Array) return Buffer.from(value);
  if (value instanceof ArrayBuffer) return Buffer.from(value);

  if (value && typeof value === "object") {
    const candidate = value as { buffer?: unknown; value?: (raw?: boolean) => unknown };

    if (typeof candidate.value === "function") {
      const inner = candidate.value(true);
      if (Buffer.isBuffer(inner)) return inner;
      if (inner instanceof Uint8Array) return Buffer.from(inner);
    }

    if (Buffer.isBuffer(candidate.buffer)) return candidate.buffer;
    if (candidate.buffer instanceof Uint8Array) return Buffer.from(candidate.buffer);
    if (candidate.buffer instanceof ArrayBuffer) return Buffer.from(candidate.buffer);
  }

  return null;
}

export async function GET(_request: Request, context: RouteContext) {
  const { folder, filename: rawFilename } = await context.params;

  // Both segments are user controlled, so both are validated against an
  // allowlist before they reach a query. No path is ever built from them.
  if (!isUploadFolder(folder)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const filename = sanitizeFilename(rawFilename);
  if (!filename) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    await connectToDatabase();
    const upload = await StoredUpload.findOne({ folder, filename })
      .select("data mimeType size")
      .lean();

    if (!upload?.data) {
      return new NextResponse("Not found", { status: 404 });
    }

    const buffer = toBuffer(upload.data);
    if (!buffer || buffer.byteLength === 0) {
      console.error("[usagwp] stored upload has no readable bytes", folder, filename);
      return new NextResponse("Not found", { status: 404 });
    }

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": upload.mimeType,
        "Content-Length": String(buffer.byteLength),
        // Filenames are content-addressed by timestamp + random suffix and are
        // never reused, so these are safe to cache permanently.
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[usagwp] failed to read upload", folder, filename, error);
    return new NextResponse("Not found", { status: 404 });
  }
}
