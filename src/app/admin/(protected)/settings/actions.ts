"use server";

import {
  parseForm,
  readLinkList,
  readString,
  revalidatePublic,
  successState,
  withAdmin,
  type ActionState,
} from "@/lib/admin/actions";
import { deleteReplacedUpload } from "@/lib/uploads/storage";
import { siteSettingsSchema } from "@/lib/validation/schemas";
import { SiteSettings } from "@/models";

export async function saveSettingsAction(
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  const parsed = parseForm(siteSettingsSchema, {
    siteName: readString(form, "siteName"),
    tagline: readString(form, "tagline"),
    siteDescription: readString(form, "siteDescription"),
    logo: readString(form, "logo"),
    favicon: readString(form, "favicon"),
    email: readString(form, "email"),
    phone: readString(form, "phone"),
    socialLinks: readLinkList(form, "socialLinks"),
    defaultSeoTitle: readString(form, "defaultSeoTitle"),
    defaultSeoDescription: readString(form, "defaultSeoDescription"),
    defaultOgImage: readString(form, "defaultOgImage"),
    footerText: readString(form, "footerText"),
    familyTreeImage: readString(form, "familyTreeImage"),
    familyLineHeading: readString(form, "familyLineHeading"),
    familyLineSubheading: readString(form, "familyLineSubheading"),
    familyTreeImageAlt: readString(form, "familyTreeImageAlt"),
    analyticsId: readString(form, "analyticsId"),
  });

  if (!parsed.ok) return parsed.state;
  const input = parsed.value;

  const result = await withAdmin(async () => {
    const existing = await SiteSettings.findOne({ key: "site" })
      .select("logo favicon defaultOgImage familyTreeImage")
      .lean();

    await SiteSettings.updateOne({ key: "site" }, { $set: { key: "site", ...input } }, { upsert: true });

    await deleteReplacedUpload(existing?.logo, input.logo);
    await deleteReplacedUpload(existing?.favicon, input.favicon);
    await deleteReplacedUpload(existing?.defaultOgImage, input.defaultOgImage);
    await deleteReplacedUpload(existing?.familyTreeImage, input.familyTreeImage);
  });

  if (!result.ok) return result.state;

  // Settings appear in the header and footer of every page.
  revalidatePublic([
    "/about",
    "/family-line",
    "/author-notes",
    "/ebook-order",
    "/faq",
    "/contact",
    "/privacy",
    "/terms",
  ]);

  return successState("Site settings saved.");
}
