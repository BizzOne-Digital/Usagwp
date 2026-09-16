import type { Metadata } from "next";

import { getSiteSettings } from "@/lib/content";
import { Page } from "@/models";
import { safeQuery } from "@/lib/db/mongoose";

export const DEFAULT_LOCALE = "en_US";

/**
 * Never hardcode the deployed domain. Vercel supplies VERCEL_URL for previews;
 * production must set NEXT_PUBLIC_SITE_URL.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;

  return "http://localhost:3000";
}

export function absoluteUrl(path = "/"): string {
  const base = getSiteUrl();
  if (!path || path === "/") return `${base}/`;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export type BuildMetadataInput = {
  title: string;
  description: string;
  path: string;
  locale?: string;
  image?: string | null;
  noIndex?: boolean;
  type?: "website" | "article" | "book";
  canonicalOverride?: string;
};

function resolveOgImage(image?: string | null): string {
  if (!image) return absoluteUrl("/opengraph-image");
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  return absoluteUrl(image);
}

export function buildMetadata(input: BuildMetadataInput): Metadata {
  const {
    title,
    description,
    path,
    locale = DEFAULT_LOCALE,
    image,
    noIndex = false,
    type = "website",
    canonicalOverride,
  } = input;

  const canonical = canonicalOverride?.trim() || absoluteUrl(path);
  const ogImage = resolveOgImage(image);

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        // Single-locale site today. Declaring x-default keeps the structure
        // correct if additional locales are added later.
        "x-default": canonical,
        en: canonical,
      },
    },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      type: type === "book" ? "article" : type,
      title,
      description,
      url: canonical,
      siteName: "Edmond Kelly",
      locale,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

/** Applied to cart, checkout and account routes the moment they exist. */
export function noIndexMetadata(title: string, path: string): Metadata {
  return buildMetadata({
    title,
    description: "",
    path,
    noIndex: true,
  });
}

type PageSeoOverride = {
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
  canonicalOverride: string;
  noIndex: boolean;
};

async function getPageSeoOverride(pageKey: string): Promise<PageSeoOverride | null> {
  return safeQuery(
    `getPageSeoOverride:${pageKey}`,
    async () => {
      const doc = await Page.findOne({ key: pageKey })
        .select("seoTitle seoDescription ogImage canonicalOverride noIndex")
        .lean();
      if (!doc) return null;
      return {
        seoTitle: doc.seoTitle ?? "",
        seoDescription: doc.seoDescription ?? "",
        ogImage: doc.ogImage ?? "",
        canonicalOverride: doc.canonicalOverride ?? "",
        noIndex: Boolean(doc.noIndex),
      };
    },
    null,
  );
}

/**
 * Resolution order for every public page:
 *   admin per-page override  ->  the page's own default  ->  global site default
 */
export async function generatePageMetadata(
  pageKey: string,
  path: string,
  defaults: { title: string; description: string; image?: string | null },
): Promise<Metadata> {
  const [override, settings] = await Promise.all([
    getPageSeoOverride(pageKey),
    getSiteSettings(),
  ]);

  const title = override?.seoTitle || defaults.title || settings.defaultSeoTitle || settings.siteName;
  const description =
    override?.seoDescription ||
    defaults.description ||
    settings.defaultSeoDescription ||
    settings.siteDescription;
  const image = override?.ogImage || defaults.image || settings.defaultOgImage || null;

  return buildMetadata({
    title,
    description,
    path,
    image,
    noIndex: override?.noIndex ?? false,
    canonicalOverride: override?.canonicalOverride,
  });
}

/* ------------------------------------------------------------- JSON-LD ---- */

export function organizationJsonLd(settings: {
  siteName: string;
  siteDescription: string;
  email: string;
  phone: string;
  socialLinks: { label: string; url: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${getSiteUrl()}/#organization`,
    name: settings.siteName,
    url: absoluteUrl("/"),
    description: settings.siteDescription,
    ...(settings.socialLinks.length ? { sameAs: settings.socialLinks.map((l) => l.url) } : {}),
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: settings.email,
        telephone: settings.phone,
        availableLanguage: ["English"],
      },
    ],
  };
}

export function websiteJsonLd(siteName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${getSiteUrl()}/#website`,
    name: siteName,
    url: absoluteUrl("/"),
    publisher: { "@id": `${getSiteUrl()}/#organization` },
    inLanguage: "en-US",
  };
}
