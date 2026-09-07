import type { MetadataRoute } from "next";

import { absoluteUrl, getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private surfaces. /api/uploads is deliberately left crawlable so that
        // cover art and social images can be fetched by crawlers and previews.
        disallow: [
          "/admin",
          "/admin/",
          "/api/upload",
          "/api/contact",
          "/api/subscribe",
          "/api/admin/",
          "/account/",
          "/cart",
          "/checkout",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: getSiteUrl(),
  };
}
