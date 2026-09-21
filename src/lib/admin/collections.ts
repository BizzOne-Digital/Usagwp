import "server-only";

import type { Model } from "mongoose";
import type { ZodType } from "zod";

import {
  BlogPost,
  Faq,
  Service,
  TeamMember,
  Testimonial,
} from "@/models";
import {
  blogPostSchema,
  faqSchema,
  serviceSchema,
  teamMemberSchema,
  testimonialSchema,
} from "@/lib/validation/schemas";

/**
 * One declarative registry drives the list view, the editor, validation and the
 * save/delete actions for every repeatable content type. Adding a new type is a
 * config entry here, not another set of near-identical pages.
 */

export type FieldType =
  | "text"
  | "url"
  | "number"
  | "date"
  | "textarea"
  | "richtext"
  | "select"
  | "checkbox"
  | "image"
  | "links";

export type FieldConfig = {
  name: string;
  label: string;
  type: FieldType;
  hint?: string;
  required?: boolean;
  rows?: number;
  options?: { value: string; label: string }[];
  folder?: "products" | "gallery" | "pages" | "misc";
  /** Groups fields into panels in the editor. */
  group?: string;
  full?: boolean;
};

export type CollectionConfig = {
  slug: string;
  singular: string;
  plural: string;
  description: string;
  model: Model<Record<string, unknown>>;
  schema: ZodType;
  fields: FieldConfig[];
  /** Fields shown as columns in the list view. */
  listPrimary: string;
  listSecondary?: string;
  /** Field that controls whether the record is publicly visible. */
  publishField: { name: string; publishedValue: unknown; label: string };
  sort: Record<string, 1 | -1>;
  /** Image fields, so replaced files can be cleaned up on save and delete. */
  imageFields: string[];
  /** Public paths to revalidate after a write. */
  revalidate: string[];
  /** Builds the public URL for a record, when it has one. */
  publicPath?: (record: Record<string, unknown>) => string | null;
};

const SEO_FIELDS: FieldConfig[] = [
  { name: "seoTitle", label: "Search title", type: "text", group: "Search and sharing" },
  {
    name: "seoDescription",
    label: "Search description",
    type: "text",
    group: "Search and sharing",
  },
];

const COLLECTIONS: CollectionConfig[] = [
  {
    slug: "author-notes",
    singular: "Author note",
    plural: "Author Notes",
    description:
      "Notes from the author about the research behind the book. Anything marked active appears on the public Author Notes page. Leave everything inactive and the page shows an honest empty state instead.",
    model: Service as unknown as Model<Record<string, unknown>>,
    schema: serviceSchema,
    listPrimary: "title",
    listSecondary: "shortDescription",
    publishField: { name: "active", publishedValue: true, label: "Active" },
    sort: { sortOrder: 1, title: 1 },
    imageFields: ["image"],
    revalidate: ["/author-notes"],
    publicPath: (record) => `/author-notes/${String(record.slug ?? "")}`,
    fields: [
      { name: "title", label: "Note title", type: "text", required: true },
      {
        name: "slug",
        label: "Web address",
        type: "text",
        required: true,
        hint: "Lowercase letters, numbers and hyphens. Appears as /author-notes/your-slug.",
      },
      {
        name: "shortDescription",
        label: "Summary",
        type: "textarea",
        rows: 3,
        hint: "One or two sentences. Shown in the Author Notes list.",
      },
      {
        name: "longDescription",
        label: "The note",
        type: "richtext",
        rows: 10,
        hint: "Leave a blank line between paragraphs.",
      },
      { name: "image", label: "Image", type: "image", folder: "gallery", group: "Media" },
      { name: "ctaLabel", label: "Button label", type: "text", group: "Call to action" },
      { name: "ctaUrl", label: "Button link", type: "url", group: "Call to action" },
      {
        name: "active",
        label: "Show this author note publicly",
        type: "checkbox",
        group: "Visibility",
      },
      {
        name: "sortOrder",
        label: "Order",
        type: "number",
        hint: "Lower numbers appear first.",
        group: "Visibility",
      },
      ...SEO_FIELDS,
    ],
  },
  {
    slug: "family-line",
    singular: "Family line entry",
    plural: "LaTanya D. Kelly-Douet Family Line",
    description:
      "One entry per person in the line of descent, in order. Only published entries appear on the public LaTanya D. Kelly-Douet Family Line page. Nothing is invented: the page shows exactly what is entered here.",
    model: TeamMember as unknown as Model<Record<string, unknown>>,
    schema: teamMemberSchema,
    listPrimary: "name",
    listSecondary: "role",
    publishField: { name: "published", publishedValue: true, label: "Published" },
    sort: { sortOrder: 1, name: 1 },
    imageFields: ["photo"],
    revalidate: ["/family-line"],
    fields: [
      { name: "name", label: "Full name", type: "text" },
      {
        name: "role",
        label: "Place in the family",
        type: "text",
        hint: "For example: son of Edmond Kelly, or great-great-grandson.",
      },
      { name: "photo", label: "Photograph", type: "image", folder: "gallery", group: "Media" },
      {
        name: "shortBio",
        label: "Short summary",
        type: "textarea",
        rows: 3,
        hint: "Dates, place, and one line on who they were. Wrap words in *asterisks* for italics.",
      },
      { name: "bio", label: "Full record", type: "richtext", rows: 8 },
      { name: "email", label: "Email", type: "text", group: "Contact and sources" },
      {
        name: "links",
        label: "Sources and links",
        type: "links",
        group: "Contact and sources",
        full: true,
      },
      {
        name: "published",
        label: "Show this person publicly",
        type: "checkbox",
        group: "Visibility",
      },
      {
        name: "sortOrder",
        label: "Order",
        type: "number",
        hint: "Lower numbers appear first.",
        group: "Visibility",
      },
    ],
  },
  {
    slug: "ebook-order",
    singular: "eBook/Paperback order entry",
    plural: "eBook/Paperback Order",
    description:
      "One entry per edition a reader can order, such as the eBook or the paperback. Drafts are never visible on the public site and are never listed in the sitemap.",
    model: BlogPost as unknown as Model<Record<string, unknown>>,
    schema: blogPostSchema,
    listPrimary: "title",
    listSecondary: "excerpt",
    publishField: { name: "status", publishedValue: "published", label: "Published" },
    sort: { publishedAt: -1, createdAt: -1 },
    imageFields: ["coverImage", "ogImage"],
    revalidate: ["/ebook-order"],
    publicPath: (record) => `/ebook-order/${String(record.slug ?? "")}`,
    fields: [
      {
        name: "title",
        label: "Edition name",
        type: "text",
        required: true,
        hint: "For example: eBook (Kindle) or Paperback.",
      },
      {
        name: "slug",
        label: "Web address",
        type: "text",
        required: true,
        hint: "Appears as /ebook-order/your-slug.",
      },
      {
        name: "excerpt",
        label: "Summary",
        type: "textarea",
        rows: 3,
        hint: "Price, format and anything the reader needs to decide. Shown in the list.",
      },
      { name: "body", label: "Full details", type: "richtext", rows: 16 },
      {
        name: "coverImage",
        label: "Cover image",
        type: "image",
        folder: "pages",
        group: "Media",
      },
      {
        name: "orderLabel",
        label: "Order button label",
        type: "text",
        group: "Where to order",
        hint: "For example: Buy on Amazon. Defaults to Order this edition.",
      },
      {
        name: "orderUrl",
        label: "Order link",
        type: "url",
        group: "Where to order",
        hint: "The retailer page for this edition. Leave it empty and no button is shown.",
      },
      {
        name: "author",
        label: "Retailer or publisher",
        type: "text",
        group: "Publishing",
        hint: "Optional. Shown under the edition name.",
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        group: "Publishing",
        options: [
          { value: "draft", label: "Draft" },
          { value: "published", label: "Published" },
        ],
      },
      {
        name: "publishedAt",
        label: "Available from",
        type: "date",
        group: "Publishing",
        hint: "Shown next to the edition name. Leave it empty if it is already available.",
      },
      ...SEO_FIELDS,
      {
        name: "ogImage",
        label: "Social sharing image",
        type: "image",
        folder: "pages",
        group: "Search and sharing",
        full: true,
      },
    ],
  },
  {
    slug: "faqs",
    singular: "Question",
    plural: "Questions",
    description:
      "Published questions appear on the public questions page and are the only ones included in its structured data.",
    model: Faq as unknown as Model<Record<string, unknown>>,
    schema: faqSchema,
    listPrimary: "question",
    listSecondary: "answer",
    publishField: { name: "published", publishedValue: true, label: "Published" },
    sort: { sortOrder: 1 },
    imageFields: [],
    revalidate: ["/faq"],
    fields: [
      { name: "question", label: "Question", type: "text", required: true },
      { name: "answer", label: "Answer", type: "richtext", rows: 6, required: true },
      { name: "published", label: "Show publicly", type: "checkbox", group: "Visibility" },
      {
        name: "sortOrder",
        label: "Order",
        type: "number",
        hint: "Lower numbers appear first.",
        group: "Visibility",
      },
    ],
  },
  {
    slug: "testimonials",
    singular: "Testimonial",
    plural: "Testimonials",
    description:
      "Add only quotes you actually have permission to publish, with a real name attached.",
    model: Testimonial as unknown as Model<Record<string, unknown>>,
    schema: testimonialSchema,
    listPrimary: "authorName",
    listSecondary: "quote",
    publishField: { name: "published", publishedValue: true, label: "Published" },
    sort: { sortOrder: 1 },
    imageFields: [],
    revalidate: ["/"],
    fields: [
      { name: "quote", label: "Quote", type: "textarea", rows: 4, required: true },
      { name: "authorName", label: "Name", type: "text", required: true },
      { name: "authorRole", label: "Role or publication", type: "text" },
      { name: "published", label: "Show publicly", type: "checkbox", group: "Visibility" },
      {
        name: "sortOrder",
        label: "Order",
        type: "number",
        hint: "Lower numbers appear first.",
        group: "Visibility",
      },
    ],
  },
];

export const COLLECTION_SLUGS = COLLECTIONS.map((collection) => collection.slug);

export function getCollection(slug: string): CollectionConfig | null {
  return COLLECTIONS.find((collection) => collection.slug === slug) ?? null;
}
