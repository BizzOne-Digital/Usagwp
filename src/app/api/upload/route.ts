import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth/session";
import {
  ALLOWED_MIME_TYPES,
  MAX_UPLOAD_BYTES,
  isUploadFolder,
  saveUpload,
} from "@/lib/uploads/storage";

// Buffer handling requires the Node runtime, not Edge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fail(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return fail("Authentication required.", 401);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail("Expected a multipart form upload.", 400);
  }

  const folder = form.get("folder");
  if (!isUploadFolder(folder)) {
    return fail("Unknown upload folder.", 400);
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return fail("No file was received.", 400);
  }

  if (!(file.type in ALLOWED_MIME_TYPES)) {
    return fail("Only JPEG, PNG, WebP and GIF images are allowed.", 415);
  }

  if (file.size <= 0) {
    return fail("The file is empty.", 400);
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return fail("Images must be 8MB or smaller.", 413);
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  // Re-check post-read: File.size is client-reported metadata.
  if (bytes.byteLength > MAX_UPLOAD_BYTES) {
    return fail("Images must be 8MB or smaller.", 413);
  }

  try {
    const saved = await saveUpload({
      folder,
      mimeType: file.type,
      bytes,
      originalName: file.name,
    });
    return NextResponse.json({ success: true, ...saved });
  } catch (error) {
    console.error("[usagwp] upload failed", error);
    return fail("The upload could not be saved. Please try again.", 500);
  }
}
