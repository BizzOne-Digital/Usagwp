"use server";

import { revalidatePath } from "next/cache";

import { readString, withAdmin } from "@/lib/admin/actions";
import { deleteUploadByUrl, isUploadFolder, sanitizeFilename, uploadPublicUrl } from "@/lib/uploads/storage";

/**
 * Deleting from the library removes the file itself. Content documents keep only
 * a URL string, so a record that referenced this file will simply fall back to
 * its no-image state rather than break.
 */
export async function deleteMediaAction(form: FormData): Promise<void> {
  const folder = readString(form, "folder");
  const rawFilename = readString(form, "filename");

  if (!isUploadFolder(folder)) return;
  const filename = sanitizeFilename(rawFilename);
  if (!filename) return;

  await withAdmin(async () => {
    await deleteUploadByUrl(uploadPublicUrl(folder, filename));
  });

  revalidatePath("/admin/media");
}
