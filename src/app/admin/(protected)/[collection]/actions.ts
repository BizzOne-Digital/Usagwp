"use server";

import { redirect } from "next/navigation";

import {
  errorState,
  parseForm,
  readBoolean,
  readLinkList,
  readString,
  revalidatePublic,
  successState,
  withAdmin,
  type ActionState,
} from "@/lib/admin/actions";
import { getCollection, type CollectionConfig } from "@/lib/admin/collections";
import { deleteReplacedUpload, deleteUploadByUrl } from "@/lib/uploads/storage";

/** Turns the submitted form into the shape the collection's Zod schema expects. */
function readValues(config: CollectionConfig, form: FormData): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const field of config.fields) {
    switch (field.type) {
      case "checkbox":
        values[field.name] = readBoolean(form, field.name);
        break;
      case "links":
        values[field.name] = readLinkList(form, field.name);
        break;
      default:
        values[field.name] = readString(form, field.name);
    }
  }
  return values;
}

function toDocument(config: CollectionConfig, values: Record<string, unknown>) {
  const document: Record<string, unknown> = { ...values };

  for (const field of config.fields) {
    if (field.type === "date") {
      const raw = values[field.name];
      document[field.name] = raw ? new Date(String(raw)) : null;
    }
    if (field.type === "number") {
      const raw = values[field.name];
      document[field.name] = raw === "" || raw === undefined ? 0 : Number(raw);
    }
  }

  // A journal entry switched to published without an explicit date gets one, so
  // it can be ordered and dated correctly on the public page.
  if (config.slug === "journal" && values.status === "published" && !document.publishedAt) {
    document.publishedAt = new Date();
  }

  return document;
}

export async function saveRecordAction(
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  const collectionSlug = readString(form, "__collection");
  const recordId = readString(form, "__id");
  const config = getCollection(collectionSlug);

  if (!config) return errorState("That content type does not exist.");

  let previousPath: string | null = null;

  const parsed = parseForm(config.schema, readValues(config, form));
  if (!parsed.ok) return parsed.state;

  const values = parsed.value as Record<string, unknown>;
  const document = toDocument(config, values);

  const result = await withAdmin(async () => {
    if (recordId && recordId !== "new") {
      const existing = await config.model.findById(recordId).lean();
      if (!existing) throw new Error("Record not found.");

      await config.model.updateOne({ _id: recordId }, { $set: document });

      // The slug may have changed, so both the old and the new detail path
      // need clearing or the previous address keeps serving a stale page.
      previousPath = config.publicPath?.(existing) ?? null;

      // Clean up any image that was genuinely replaced or cleared.
      for (const fieldName of config.imageFields) {
        await deleteReplacedUpload(
          existing[fieldName] as string | undefined,
          document[fieldName] as string | undefined,
        );
      }
      return { id: recordId, created: false };
    }

    const created = await config.model.create(document);
    return { id: String(created._id), created: true };
  });

  if (!result.ok) return result.state;

  // A detail page is its own cached route: revalidating only the index would
  // leave an unpublished or renamed record still reachable at its old address.
  revalidatePublic(
    [
      ...config.revalidate,
      config.publicPath?.(document) ?? null,
      previousPath,
    ].filter((path): path is string => Boolean(path)),
  );

  if (result.value.created) {
    redirect(`/admin/${config.slug}/${result.value.id}?created=1`);
  }

  return successState(`${config.singular} saved.`);
}

export async function deleteRecordAction(form: FormData): Promise<void> {
  const collectionSlug = readString(form, "__collection");
  const recordId = readString(form, "__id");
  const config = getCollection(collectionSlug);
  if (!config || !recordId) return;

  let deletedPath: string | null = null;

  const result = await withAdmin(async () => {
    const existing = await config.model.findById(recordId).lean();
    if (!existing) return;

    deletedPath = config.publicPath?.(existing) ?? null;
    await config.model.deleteOne({ _id: recordId });

    // Remove the files this record owned, so deleting content does not leave
    // orphaned binaries in the database.
    for (const fieldName of config.imageFields) {
      await deleteUploadByUrl(existing[fieldName] as string | undefined);
    }
  });

  if (result.ok) {
    revalidatePublic(
      [...config.revalidate, deletedPath].filter((path): path is string => Boolean(path)),
    );
  }

  redirect(`/admin/${config.slug}`);
}

export async function togglePublishAction(form: FormData): Promise<void> {
  const collectionSlug = readString(form, "__collection");
  const recordId = readString(form, "__id");
  const nextPublished = readString(form, "__next") === "1";
  const config = getCollection(collectionSlug);
  if (!config || !recordId) return;

  const { name, publishedValue } = config.publishField;
  const unpublishedValue = typeof publishedValue === "boolean" ? false : "draft";

  let togglePath: string | null = null;

  const result = await withAdmin(async () => {
    const existing = await config.model.findById(recordId).lean();
    if (!existing) return;

    togglePath = config.publicPath?.(existing) ?? null;
    await config.model.updateOne(
      { _id: recordId },
      { $set: { [name]: nextPublished ? publishedValue : unpublishedValue } },
    );
  });

  if (result.ok) {
    revalidatePublic(
      [...config.revalidate, togglePath].filter((path): path is string => Boolean(path)),
    );
  }
  redirect(`/admin/${config.slug}`);
}
