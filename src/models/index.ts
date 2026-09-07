/**
 * All Mongoose models are declared here so that model registration happens once
 * per process. Next.js hot-reloads modules in dev, so every model is created
 * through defineModel, which reuses an already-compiled model when present.
 */
import mongoose, { Schema, type Model, type InferSchemaType } from "mongoose";

function defineModel<S extends Schema>(name: string, schema: S) {
  return (
    (mongoose.models[name] as Model<InferSchemaType<S>>) ??
    mongoose.model<InferSchemaType<S>>(name, schema)
  );
}

/* ------------------------------------------------------------------ uploads */

const StoredUploadSchema = new Schema(
  {
    folder: { type: String, required: true, index: true },
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true },
    originalName: { type: String, default: "" },
    alt: { type: String, default: "" },
  },
  { timestamps: true },
);
StoredUploadSchema.index({ folder: 1, filename: 1 }, { unique: true });
StoredUploadSchema.index({ createdAt: -1 });
export const StoredUpload = defineModel("StoredUpload", StoredUploadSchema);

/* --------------------------------------------------------------------- book */

const RetailerSchema = new Schema(
  { label: { type: String, required: true }, url: { type: String, required: true } },
  { _id: false },
);

const BookSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    author: { type: String, required: true },
    description: { type: String, default: "" },
    longDescription: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    coverAlt: { type: String, default: "" },
    galleryImages: { type: [String], default: [] },
    // "coming-soon" hides every commerce affordance across the public site.
    publicationStatus: {
      type: String,
      enum: ["coming-soon", "published"],
      default: "coming-soon",
      index: true,
    },
    publicationDate: { type: Date, default: null },
    isbn: { type: String, default: "" },
    price: { type: Number, default: null },
    currency: { type: String, default: "USD" },
    pageCount: { type: Number, default: null },
    format: { type: String, default: "" },
    purchaseUrl: { type: String, default: "" },
    amazonUrl: { type: String, default: "" },
    retailers: { type: [RetailerSchema], default: [] },
    featured: { type: Boolean, default: true },
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
    ogImage: { type: String, default: "" },
  },
  { timestamps: true },
);
export const Book = defineModel("Book", BookSchema);

/* -------------------------------------------------------------------- pages */

const PageSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    // Named blocks, so the admin can retitle sections without a deploy.
    sections: { type: Schema.Types.Mixed, default: {} },
    published: { type: Boolean, default: true, index: true },
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
    ogImage: { type: String, default: "" },
    canonicalOverride: { type: String, default: "" },
    noIndex: { type: Boolean, default: false },
  },
  { timestamps: true },
);
export const Page = defineModel("Page", PageSchema);

/* ----------------------------------------------------------------- services */

const ServiceSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    shortDescription: { type: String, default: "" },
    longDescription: { type: String, default: "" },
    image: { type: String, default: "" },
    ctaLabel: { type: String, default: "" },
    ctaUrl: { type: String, default: "" },
    active: { type: Boolean, default: false, index: true },
    sortOrder: { type: Number, default: 0 },
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
  },
  { timestamps: true },
);
ServiceSchema.index({ active: 1, sortOrder: 1 });
export const Service = defineModel("Service", ServiceSchema);

/* --------------------------------------------------------------------- team */

const LinkSchema = new Schema(
  { label: { type: String, default: "" }, url: { type: String, default: "" } },
  { _id: false },
);

const TeamMemberSchema = new Schema(
  {
    name: { type: String, required: true },
    role: { type: String, default: "" },
    photo: { type: String, default: "" },
    shortBio: { type: String, default: "" },
    bio: { type: String, default: "" },
    email: { type: String, default: "" },
    links: { type: [LinkSchema], default: [] },
    published: { type: Boolean, default: false, index: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);
TeamMemberSchema.index({ published: 1, sortOrder: 1 });
export const TeamMember = defineModel("TeamMember", TeamMemberSchema);

/* ---------------------------------------------------------------------- faq */

const FaqSchema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    published: { type: Boolean, default: false, index: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);
FaqSchema.index({ published: 1, sortOrder: 1 });
export const Faq = defineModel("Faq", FaqSchema);

/* ------------------------------------------------------------- testimonials */

const TestimonialSchema = new Schema(
  {
    quote: { type: String, required: true },
    authorName: { type: String, required: true },
    authorRole: { type: String, default: "" },
    published: { type: Boolean, default: false, index: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);
TestimonialSchema.index({ published: 1, sortOrder: 1 });
export const Testimonial = defineModel("Testimonial", TestimonialSchema);

/* --------------------------------------------------------------- blog posts */

const BlogPostSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    excerpt: { type: String, default: "" },
    body: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    author: { type: String, default: "" },
    status: { type: String, enum: ["draft", "published"], default: "draft", index: true },
    publishedAt: { type: Date, default: null },
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
    ogImage: { type: String, default: "" },
  },
  { timestamps: true },
);
BlogPostSchema.index({ status: 1, publishedAt: -1 });
export const BlogPost = defineModel("BlogPost", BlogPostSchema);

/* ------------------------------------------------------------ site settings */

const SiteSettingsSchema = new Schema(
  {
    // Single-document collection, pinned by this key.
    key: { type: String, default: "site", unique: true },
    siteName: { type: String, default: "USAGWP" },
    tagline: { type: String, default: "" },
    siteDescription: { type: String, default: "" },
    logo: { type: String, default: "" },
    favicon: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    socialLinks: { type: [LinkSchema], default: [] },
    defaultSeoTitle: { type: String, default: "" },
    defaultSeoDescription: { type: String, default: "" },
    defaultOgImage: { type: String, default: "" },
    footerText: { type: String, default: "" },
    analyticsId: { type: String, default: "" },
  },
  { timestamps: true },
);
export const SiteSettings = defineModel("SiteSettings", SiteSettingsSchema);

/* ------------------------------------------------------------ admin + leads */

const AdminUserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, default: "" },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["owner", "editor"], default: "editor" },
    lastLoginAt: { type: Date, default: null },
    // Bumped on password change to invalidate every issued session token.
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true },
);
export const AdminUser = defineModel("AdminUser", AdminUserSchema);

const SubscriberSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    firstName: { type: String, default: "" },
    source: { type: String, default: "site" },
    confirmed: { type: Boolean, default: false },
  },
  { timestamps: true },
);
export const Subscriber = defineModel("Subscriber", SubscriberSchema);

const ContactMessageSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    subject: { type: String, default: "" },
    message: { type: String, required: true },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);
ContactMessageSchema.index({ createdAt: -1 });
export const ContactMessage = defineModel("ContactMessage", ContactMessageSchema);
