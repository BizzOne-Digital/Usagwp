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
    slug: "services",
    singular: "Service",
    plural: "Services",
    description:
      "Anything marked active appears on the public services page. Leave everything inactive and the page shows an honest empty state instead.",
    model: Service as unknown as Model<Record<string, unknown>>,
    schema: serviceSchema,
    listPrimary: "title",
    listSecondary: "shortDescription",
    publishField: { name: "active", publishedValue: true, label: "Active" },
    sort: { sortOrder: 1, title: 1 },
    imageFields: ["image"],
    revalidate: ["/services"],
    publicPath: (record) => `/services/${String(record.slug ?? "")}`,
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      {
        name: "slug",
        label: "Web address",
        type: "text",
        required: true,
        hint: "Lowercase letters, numbers and hyphens. Appears as /services/your-slug.",
      },
      {
        name: "shortDescription",
        label: "Short description",
        type: "textarea",
        rows: 3,
        hint: "Shown in the services list.",
      },
      {
        name: "longDescription",
        label: "Full description",
        type: "richtext",
        rows: 10,
        hint: "Leave a blank line between paragraphs.",
      },
      { name: "image", label: "Image", type: "image", folder: "gallery", group: "Media" },
      { name: "ctaLabel", label: "Button label", type: "text", group: "Call to action" },
      { name: "ctaUrl", label: "Button link", type: "url", group: "Call to action" },
      {
        name: "active",
        label: "Show this service publicly",
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
    slug: "team",
    singular: "Team member",
    plural: "Team",
    description:
      "Only published members appear on the public team page. Nothing is invented: the page shows exactly what is entered here.",
    model: TeamMember as unknown as Model<Record<string, unknown>>,
    schema: teamMemberSchema,
    listPrimary: "name",
    listSecondary: "role",
    publishField: { name: "published", publishedValue: true, label: "Published" },
    sort: { sortOrder: 1, name: 1 },
    imageFields: ["photo"],
    revalidate: ["/team"],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "role", label: "Role", type: "text" },
      { name: "photo", label: "Photo", type: "image", folder: "gallery", group: "Media" },
      { name: "shortBio", label: "Short biography", type: "textarea", rows: 3 },
      { name: "bio", label: "Full biography", type: "richtext", rows: 8 },
      { name: "email", label: "Email", type: "text", group: "Contact" },
      { name: "links", label: "Links", type: "links", group: "Contact", full: true },
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
    slug: "journal",
    singular: "Journal entry",
    plural: "Journal",
    description:
      "Drafts are never visible on the public site and are never listed in the sitemap.",
    model: BlogPost as unknown as Model<Record<string, unknown>>,
    schema: blogPostSchema,
    listPrimary: "title",
    listSecondary: "excerpt",
    publishField: { name: "status", publishedValue: "published", label: "Published" },
    sort: { publishedAt: -1, createdAt: -1 },
    imageFields: ["coverImage", "ogImage"],
    revalidate: ["/journal"],
    publicPath: (record) => `/journal/${String(record.slug ?? "")}`,
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      {
        name: "slug",
        label: "Web address",
        type: "text",
        required: true,
        hint: "Appears as /journal/your-slug.",
      },
      { name: "excerpt", label: "Summary", type: "textarea", rows: 3 },
      { name: "body", label: "Entry", type: "richtext", rows: 16 },
      {
        name: "coverImage",
        label: "Cover image",
        type: "image",
        folder: "pages",
        group: "Media",
      },
      { name: "author", label: "Author", type: "text", group: "Publishing" },
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
      { name: "publishedAt", label: "Publication date", type: "date", group: "Publishing" },
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
