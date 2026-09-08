import { z } from "zod";

/** Shared validation. Used by client forms AND re-run server-side on every write. */

const trimmed = (max: number) => z.string().trim().max(max);
const optionalText = (max: number) => trimmed(max).optional().default("");

export const slugSchema = z
  .string()
  .trim()
  .min(1, "A slug is required.")
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only.");

export const optionalUrlSchema = z
  .union([z.literal(""), z.string().trim().url("Enter a valid URL.")])
  .optional()
  .default("");

/** Accepts our own upload URLs as well as absolute external URLs. */
export const imageRefSchema = z
  .union([
    z.literal(""),
    z.string().trim().startsWith("/api/uploads/"),
    z.string().trim().url(),
  ])
  .optional()
  .default("");

export const linkSchema = z.object({
  label: trimmed(60),
  url: z.string().trim().url("Enter a valid URL."),
});

/* --------------------------------------------------------------- public --- */

export const contactSchema = z.object({
  name: trimmed(120).min(2, "Please enter your name."),
  email: z.string().trim().email("Enter a valid email address.").max(200),
  phone: optionalText(40),
  subject: optionalText(160),
  message: trimmed(4000).min(10, "Please tell us a little more."),
  // Honeypot: real people never fill this in.
  website: z.string().max(0).optional().default(""),
});

export const subscribeSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(200),
  firstName: optionalText(80),
  website: z.string().max(0).optional().default(""),
});

/* ---------------------------------------------------------------- admin --- */

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(200),
  password: z.string().min(8, "Password must be at least 8 characters.").max(200),
});

export const bookSchema = z.object({
  title: trimmed(200).min(1, "A title is required."),
  subtitle: optionalText(240),
  author: trimmed(160).min(1, "An author is required."),
  description: optionalText(600),
  longDescription: optionalText(8000),
  coverImage: imageRefSchema,
  coverAlt: optionalText(200),
  publicationStatus: z.enum(["coming-soon", "published"]),
  publicationDate: z.union([z.literal(""), z.iso.date()]).optional().default(""),
  isbn: optionalText(24),
  price: z
    .union([z.literal(""), z.coerce.number().min(0).max(100000)])
    .optional()
    .default(""),
  currency: optionalText(8),
  pageCount: z
    .union([z.literal(""), z.coerce.number().int().min(0).max(20000)])
    .optional()
    .default(""),
  format: optionalText(80),
  purchaseUrl: optionalUrlSchema,
  amazonUrl: optionalUrlSchema,
  retailers: z.array(linkSchema).max(12).optional().default([]),
  seoTitle: optionalText(160),
  seoDescription: optionalText(320),
  ogImage: imageRefSchema,
});

export const serviceSchema = z.object({
  slug: slugSchema,
  title: trimmed(160).min(1, "A title is required."),
  shortDescription: optionalText(400),
  longDescription: optionalText(8000),
  image: imageRefSchema,
  ctaLabel: optionalText(60),
  ctaUrl: optionalUrlSchema,
  active: z.coerce.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
  seoTitle: optionalText(160),
  seoDescription: optionalText(320),
});

export const teamMemberSchema = z.object({
  name: trimmed(160).min(1, "A name is required."),
  role: optionalText(160),
  photo: imageRefSchema,
  shortBio: optionalText(400),
  bio: optionalText(6000),
  email: z.union([z.literal(""), z.string().trim().email()]).optional().default(""),
  links: z.array(linkSchema).max(8).optional().default([]),
  published: z.coerce.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
});

export const faqSchema = z.object({
  question: trimmed(300).min(1, "A question is required."),
  answer: trimmed(4000).min(1, "An answer is required."),
  published: z.coerce.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
});

export const testimonialSchema = z.object({
  quote: trimmed(600).min(1, "A quote is required."),
  authorName: trimmed(160).min(1, "An attribution name is required."),
  authorRole: optionalText(160),
  published: z.coerce.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
});

export const blogPostSchema = z.object({
  slug: slugSchema,
  title: trimmed(240).min(1, "A title is required."),
  excerpt: optionalText(400),
  body: optionalText(40000),
  coverImage: imageRefSchema,
  author: optionalText(160),
  orderLabel: optionalText(80),
  orderUrl: optionalUrlSchema,
  status: z.enum(["draft", "published"]),
  publishedAt: z.union([z.literal(""), z.iso.date()]).optional().default(""),
  seoTitle: optionalText(160),
  seoDescription: optionalText(320),
  ogImage: imageRefSchema,
});

export const pageSchema = z.object({
  key: slugSchema,
  title: trimmed(200).min(1, "A title is required."),
  published: z.coerce.boolean().default(true),
  seoTitle: optionalText(160),
  seoDescription: optionalText(320),
  ogImage: imageRefSchema,
  canonicalOverride: optionalUrlSchema,
  noIndex: z.coerce.boolean().default(false),
});

export const siteSettingsSchema = z.object({
  siteName: trimmed(120).min(1, "A site name is required."),
  tagline: optionalText(200),
  siteDescription: optionalText(400),
  logo: imageRefSchema,
  favicon: imageRefSchema,
  email: z.union([z.literal(""), z.string().trim().email()]).optional().default(""),
  phone: optionalText(40),
  socialLinks: z.array(linkSchema).max(10).optional().default([]),
  defaultSeoTitle: optionalText(160),
  defaultSeoDescription: optionalText(320),
  defaultOgImage: imageRefSchema,
  footerText: optionalText(600),
  familyTreeImage: imageRefSchema,
  familyTreeImageAlt: optionalText(200),
  analyticsId: optionalText(60),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type SubscribeInput = z.infer<typeof subscribeSchema>;
export type BookInput = z.infer<typeof bookSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type TeamMemberInput = z.infer<typeof teamMemberSchema>;
export type FaqInput = z.infer<typeof faqSchema>;
export type TestimonialInput = z.infer<typeof testimonialSchema>;
export type BlogPostInput = z.infer<typeof blogPostSchema>;
export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
