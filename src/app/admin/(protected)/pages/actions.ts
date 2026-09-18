"use server";

import { z } from "zod";

import {
  parseForm,
  readBoolean,
  readString,
  revalidatePublic,
  successState,
  withAdmin,
  type ActionState,
} from "@/lib/admin/actions";
import { deleteReplacedUpload } from "@/lib/uploads/storage";
import { imageRefSchema, optionalUrlSchema, slugSchema } from "@/lib/validation/schemas";
import { Page } from "@/models";

const pageSeoSchema = z.object({
  key: slugSchema,
  seoTitle: z.string().trim().max(160).optional().default(""),
  seoDescription: z.string().trim().max(320).optional().default(""),
  ogImage: imageRefSchema,
  canonicalOverride: optionalUrlSchema,
  noIndex: z.boolean(),
});

/**
 * The keys are the stored `Page.key` values and stay as they were when the
 * sections were named Services, Team and Journal, so existing SEO overrides are
 * not orphaned. Only the public paths they map to were renamed.
 */
const PATHS: Record<string, string> = {
  home: "/",
  book: "/book",
  about: "/about",
  team: "/family-line",
  services: "/author-notes",
  journal: "/ebook-order",
  faq: "/faq",
  contact: "/contact",
  privacy: "/privacy",
  terms: "/terms",
};

export async function savePageSeoAction(
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  const parsed = parseForm(pageSeoSchema, {
    key: readString(form, "key"),
    seoTitle: readString(form, "seoTitle"),
    seoDescription: readString(form, "seoDescription"),
    ogImage: readString(form, "ogImage"),
    canonicalOverride: readString(form, "canonicalOverride"),
    noIndex: readBoolean(form, "noIndex"),
  });

  if (!parsed.ok) return parsed.state;
  const input = parsed.value;

  const path = PATHS[input.key];
  if (!path) return { status: "error", message: "That page is not managed here." };

  const result = await withAdmin(async () => {
    const existing = await Page.findOne({ key: input.key }).select("ogImage").lean();

    await Page.updateOne(
      { key: input.key },
      {
        $set: {
          key: input.key,
          seoTitle: input.seoTitle,
          seoDescription: input.seoDescription,
          ogImage: input.ogImage,
          canonicalOverride: input.canonicalOverride,
          noIndex: input.noIndex,
        },
        $setOnInsert: { title: input.key, published: true },
      },
      { upsert: true },
    );

    await deleteReplacedUpload(existing?.ogImage, input.ogImage);
  });

  if (!result.ok) return result.state;

  revalidatePublic([path]);
  return successState("Saved.");
}
