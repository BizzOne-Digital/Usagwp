import "server-only";

import { safeQuery } from "@/lib/db/mongoose";
import {
  Book,
  BlogPost,
  Faq,
  Service,
  SiteSettings,
  TeamMember,
  Testimonial,
} from "@/models";

/**
 * Read layer for the public site. Every accessor degrades to a sensible default
 * rather than throwing, so a database outage or an unconfigured environment
 * still renders a complete, honest page.
 */

export const BOOK_SLUG = "one-thread-in-the-fabric-of-freedom";

export type PublicationStatus = "coming-soon" | "published";

export type BookView = {
  slug: string;
  title: string;
  subtitle: string;
  author: string;
  description: string;
  longDescription: string;
  coverImage: string;
  coverAlt: string;
  galleryImages: string[];
  publicationStatus: PublicationStatus;
  publicationDate: string | null;
  isbn: string;
  price: number | null;
  currency: string;
  pageCount: number | null;
  format: string;
  purchaseUrl: string;
  amazonUrl: string;
  retailers: { label: string; url: string }[];
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
};

/**
 * The one piece of content that ships pre-filled, because it is supplied by the
 * client and the site is meaningless without it. Everything else is CMS-driven
 * and renders an empty state until the client adds it.
 */
export const BOOK_FALLBACK: BookView = {
  slug: BOOK_SLUG,
  title: "One Thread in the Fabric of Freedom",
  subtitle: "The true story of Reverend Edmond Kelly",
  author: "Peter Douet",
  description:
    "The true story of Reverend Edmond Kelly, born into slavery in Columbia, Tennessee, in 1817, who taught himself to read in secret and spent years preaching across America, England and Ireland to buy his family out of bondage.",
  longDescription:
    "One Thread in the Fabric of Freedom by Peter Douet is a biographical and historical narrative tracing the true story of Reverend Edmond Kelly, the author's ancestor, who was born into slavery in Columbia, Tennessee, in 1817.\n\nThe book follows his remarkable journey as he secretly teaches himself to read, becomes the first Black man ordained as a Baptist minister in Tennessee, and, after fleeing bondage, spends years preaching across America, England, and Ireland to raise the $2,800 needed to purchase the freedom of his wife and children, which he ultimately achieves.\n\nBlending faith, courage, and the fight for equality, the book recounts his meetings with Abraham Lincoln, his ministry to escaped slaves during the Civil War, his founding of numerous churches, and his lifelong dedication to freedom and the Gospel, preserving a family legacy of perseverance and triumph over slavery.",
  coverImage: "",
  coverAlt: "",
  galleryImages: [],
  publicationStatus: "coming-soon",
  publicationDate: null,
  isbn: "",
  price: null,
  currency: "USD",
  pageCount: null,
  format: "",
  purchaseUrl: "",
  amazonUrl: "",
  retailers: [],
  seoTitle: "",
  seoDescription: "",
  ogImage: "",
};

/**
 * Commercial detail is stripped for the public site while the book is unpublished.
 *
 * This is not only a display concern. Anything a page component receives can end
 * up serialised into the payload the browser downloads, so an unannounced price,
 * ISBN, publication date or retailer link would be readable in the page source
 * long before the client intends to announce it. Removing the values here means
 * no public page can leak them, whatever it chooses to render.
 */
function withoutUnreleasedDetail(book: BookView): BookView {
  if (book.publicationStatus === "published") return book;
  return {
    ...book,
    publicationDate: null,
    isbn: "",
    price: null,
    pageCount: null,
    format: "",
    purchaseUrl: "",
    amazonUrl: "",
    retailers: [],
  };
}

/** For public pages. Never exposes commercial detail before publication. */
export async function getBook(): Promise<BookView> {
  return withoutUnreleasedDetail(await getBookRecord());
}

/** For the admin editor, which must show everything that is stored. */
export async function getBookForAdmin(): Promise<BookView> {
  return getBookRecord();
}

async function getBookRecord(): Promise<BookView> {
  return safeQuery(
    "getBook",
    async () => {
      const doc = await Book.findOne({ slug: BOOK_SLUG }).lean();
      if (!doc) return BOOK_FALLBACK;
      return {
        slug: doc.slug,
        title: doc.title || BOOK_FALLBACK.title,
        subtitle: doc.subtitle ?? "",
        author: doc.author || BOOK_FALLBACK.author,
        description: doc.description || BOOK_FALLBACK.description,
        longDescription: doc.longDescription || BOOK_FALLBACK.longDescription,
        coverImage: doc.coverImage ?? "",
        coverAlt: doc.coverAlt ?? "",
        galleryImages: doc.galleryImages ?? [],
        publicationStatus: (doc.publicationStatus as PublicationStatus) ?? "coming-soon",
        publicationDate: doc.publicationDate ? doc.publicationDate.toISOString() : null,
        isbn: doc.isbn ?? "",
        price: doc.price ?? null,
        currency: doc.currency || "USD",
        pageCount: doc.pageCount ?? null,
        format: doc.format ?? "",
        purchaseUrl: doc.purchaseUrl ?? "",
        amazonUrl: doc.amazonUrl ?? "",
        retailers: (doc.retailers ?? []).map((r) => ({ label: r.label, url: r.url })),
        seoTitle: doc.seoTitle ?? "",
        seoDescription: doc.seoDescription ?? "",
        ogImage: doc.ogImage ?? "",
      } satisfies BookView;
    },
    BOOK_FALLBACK,
  );
}

/** True only when the admin has switched the book to published AND set a price or link. */
export function isForSale(book: BookView): boolean {
  if (book.publicationStatus !== "published") return false;
  return Boolean(book.purchaseUrl || book.amazonUrl || book.retailers.length > 0 || book.price);
}

export type SiteSettingsView = {
  siteName: string;
  tagline: string;
  siteDescription: string;
  logo: string;
  email: string;
  phone: string;
  socialLinks: { label: string; url: string }[];
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  defaultOgImage: string;
  footerText: string;
  familyTreeImage: string;
  familyTreeImageAlt: string;
};

export const SITE_SETTINGS_FALLBACK: SiteSettingsView = {
  siteName: "Edmond Kelly",
  tagline: "One Thread in the Fabric of Freedom",
  siteDescription:
    "Edmond Kelly preserves and shares the true story of Reverend Edmond Kelly, set down by Peter Douet in the forthcoming book One Thread in the Fabric of Freedom, continuing the work of his late wife LaTanya D. Kelly-Douet, Edmond Kelly's descendant.",
  logo: "",
  email: "support@usagwp.com",
  phone: "9165009232",
  socialLinks: [],
  defaultSeoTitle: "",
  defaultSeoDescription: "",
  defaultOgImage: "",
  footerText: "",
  familyTreeImage: "",
  familyTreeImageAlt: "",
};

export async function getSiteSettings(): Promise<SiteSettingsView> {
  return safeQuery(
    "getSiteSettings",
    async () => {
      const doc = await SiteSettings.findOne({ key: "site" }).lean();
      if (!doc) return SITE_SETTINGS_FALLBACK;
      return {
        siteName:
          !doc.siteName || doc.siteName === "USAGWP"
            ? SITE_SETTINGS_FALLBACK.siteName
            : doc.siteName,
        tagline: doc.tagline || SITE_SETTINGS_FALLBACK.tagline,
        siteDescription:
          !doc.siteDescription || doc.siteDescription.includes("USAGWP")
            ? SITE_SETTINGS_FALLBACK.siteDescription
            : doc.siteDescription,
        logo: doc.logo ?? "",
        email: doc.email || SITE_SETTINGS_FALLBACK.email,
        phone: doc.phone || SITE_SETTINGS_FALLBACK.phone,
        socialLinks: (doc.socialLinks ?? [])
          .filter((l) => l.label && l.url)
          .map((l) => ({ label: l.label ?? "", url: l.url ?? "" })),
        defaultSeoTitle: doc.defaultSeoTitle ?? "",
        defaultSeoDescription: doc.defaultSeoDescription ?? "",
        defaultOgImage: doc.defaultOgImage ?? "",
        footerText: doc.footerText ?? "",
        familyTreeImage: doc.familyTreeImage ?? "",
        familyTreeImageAlt: doc.familyTreeImageAlt ?? "",
      } satisfies SiteSettingsView;
    },
    SITE_SETTINGS_FALLBACK,
  );
}

export type ServiceView = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  image: string;
  ctaLabel: string;
  ctaUrl: string;
  seoTitle: string;
  seoDescription: string;
};

export async function getActiveServices(): Promise<ServiceView[]> {
  return safeQuery(
    "getActiveServices",
    async () => {
      const docs = await Service.find({ active: true }).sort({ sortOrder: 1, title: 1 }).lean();
      return docs.map((doc) => ({
        id: String(doc._id),
        slug: doc.slug,
        title: doc.title,
        shortDescription: doc.shortDescription ?? "",
        longDescription: doc.longDescription ?? "",
        image: doc.image ?? "",
        ctaLabel: doc.ctaLabel ?? "",
        ctaUrl: doc.ctaUrl ?? "",
        seoTitle: doc.seoTitle ?? "",
        seoDescription: doc.seoDescription ?? "",
      }));
    },
    [],
  );
}

export async function getServiceBySlug(slug: string): Promise<ServiceView | null> {
  return safeQuery(
    "getServiceBySlug",
    async () => {
      const doc = await Service.findOne({ slug, active: true }).lean();
      if (!doc) return null;
      return {
        id: String(doc._id),
        slug: doc.slug,
        title: doc.title,
        shortDescription: doc.shortDescription ?? "",
        longDescription: doc.longDescription ?? "",
        image: doc.image ?? "",
        ctaLabel: doc.ctaLabel ?? "",
        ctaUrl: doc.ctaUrl ?? "",
        seoTitle: doc.seoTitle ?? "",
        seoDescription: doc.seoDescription ?? "",
      };
    },
    null,
  );
}

export type TeamMemberView = {
  id: string;
  name: string;
  role: string;
  photo: string;
  shortBio: string;
  bio: string;
  links: { label: string; url: string }[];
};

export async function getPublishedTeam(): Promise<TeamMemberView[]> {
  return safeQuery(
    "getPublishedTeam",
    async () => {
      const docs = await TeamMember.find({ published: true })
        .sort({ sortOrder: 1, name: 1 })
        .lean();
      return docs.map((doc) => ({
        id: String(doc._id),
        name: doc.name,
        role: doc.role ?? "",
        photo: doc.photo ?? "",
        shortBio: doc.shortBio ?? "",
        bio: doc.bio ?? "",
        links: (doc.links ?? [])
          .filter((l) => l.label && l.url)
          .map((l) => ({ label: l.label ?? "", url: l.url ?? "" })),
      }));
    },
    [],
  );
}

export type FaqView = { id: string; question: string; answer: string };

export async function getPublishedFaqs(): Promise<FaqView[]> {
  return safeQuery(
    "getPublishedFaqs",
    async () => {
      const docs = await Faq.find({ published: true }).sort({ sortOrder: 1 }).lean();
      return docs.map((doc) => ({
        id: String(doc._id),
        question: doc.question,
        answer: doc.answer,
      }));
    },
    [],
  );
}

export type TestimonialView = {
  id: string;
  quote: string;
  authorName: string;
  authorRole: string;
};

export async function getPublishedTestimonials(): Promise<TestimonialView[]> {
  return safeQuery(
    "getPublishedTestimonials",
    async () => {
      const docs = await Testimonial.find({ published: true }).sort({ sortOrder: 1 }).lean();
      return docs.map((doc) => ({
        id: String(doc._id),
        quote: doc.quote,
        authorName: doc.authorName,
        authorRole: doc.authorRole ?? "",
      }));
    },
    [],
  );
}

export type BlogPostView = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverImage: string;
  author: string;
  orderLabel: string;
  orderUrl: string;
  publishedAt: string | null;
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
};

export async function getPublishedPosts(limit?: number): Promise<BlogPostView[]> {
  return safeQuery(
    "getPublishedPosts",
    async () => {
      const query = BlogPost.find({ status: "published" }).sort({ publishedAt: -1, createdAt: -1 });
      if (limit) query.limit(limit);
      const docs = await query.lean();
      return docs.map((doc) => ({
        id: String(doc._id),
        slug: doc.slug,
        title: doc.title,
        excerpt: doc.excerpt ?? "",
        body: doc.body ?? "",
        coverImage: doc.coverImage ?? "",
        author: doc.author ?? "",
        orderLabel: doc.orderLabel ?? "",
        orderUrl: doc.orderUrl ?? "",
        publishedAt: doc.publishedAt ? doc.publishedAt.toISOString() : null,
        seoTitle: doc.seoTitle ?? "",
        seoDescription: doc.seoDescription ?? "",
        ogImage: doc.ogImage ?? "",
      }));
    },
    [],
  );
}

export async function getPostBySlug(slug: string): Promise<BlogPostView | null> {
  return safeQuery(
    "getPostBySlug",
    async () => {
      const doc = await BlogPost.findOne({ slug, status: "published" }).lean();
      if (!doc) return null;
      return {
        id: String(doc._id),
        slug: doc.slug,
        title: doc.title,
        excerpt: doc.excerpt ?? "",
        body: doc.body ?? "",
        coverImage: doc.coverImage ?? "",
        author: doc.author ?? "",
        orderLabel: doc.orderLabel ?? "",
        orderUrl: doc.orderUrl ?? "",
        publishedAt: doc.publishedAt ? doc.publishedAt.toISOString() : null,
        seoTitle: doc.seoTitle ?? "",
        seoDescription: doc.seoDescription ?? "",
        ogImage: doc.ogImage ?? "",
      };
    },
    null,
  );
}
