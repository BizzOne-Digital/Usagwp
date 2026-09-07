"use server";

import { revalidatePath } from "next/cache";

import { readString, withAdmin } from "@/lib/admin/actions";
import { ContactMessage } from "@/models";

export async function markMessageReadAction(form: FormData): Promise<void> {
  const id = readString(form, "id");
  const read = readString(form, "read") === "1";
  if (!id) return;

  await withAdmin(async () => {
    await ContactMessage.updateOne({ _id: id }, { $set: { read } });
  });

  revalidatePath("/admin/messages");
}

export async function deleteMessageAction(form: FormData): Promise<void> {
  const id = readString(form, "id");
  if (!id) return;

  await withAdmin(async () => {
    await ContactMessage.deleteOne({ _id: id });
  });

  revalidatePath("/admin/messages");
}
