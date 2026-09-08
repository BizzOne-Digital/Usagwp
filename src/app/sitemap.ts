import type { MetadataRoute } from "next";

import { getActiveServices, getPublishedPosts } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";

/**
 * Public routes only. Admin, API, drafts and unpublished content are never
 * listed. Cart, checkout and account routes stay out of the sitemap by design:
 * when they exist they carry noIndex metadata.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/book"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/family-tree"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/author-notes"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/ebook-order"), lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: absoluteUrl("/faq"), lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: absoluteUrl("/contact"), lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: absoluteUrl("/privacy"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/terms"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const [services, posts] = await Promise.all([getActiveServices(), getPublishedPosts()]);

  const serviceRoutes: MetadataRoute.Sitemap = services.map((service) => ({
    url: absoluteUrl(`/author-notes/${service.slug}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: absoluteUrl(`/ebook-order/${post.slug}`),
    lastModified: post.publishedAt ? new Date(post.publishedAt) : now,
    changeFrequency: "yearly",
    priority: 0.4,
  }));

  return [...staticRoutes, ...serviceRoutes, ...postRoutes];
}
