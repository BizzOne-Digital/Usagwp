import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Uploaded media is served from MongoDB through our own route handler.
    // Keeping it on localPatterns means next/image optimisation still applies.
    localPatterns: [
      { pathname: "/api/uploads/**" },
      { pathname: "/brand/**" },
    ],
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    // The Services, Team and Journal sections were renamed to Author Notes,
    // Lineage and eBook/Paperback Order. These keep old links, bookmarks
    // and indexed search results working.
    return [
      { source: "/services", destination: "/author-notes", permanent: true },
      { source: "/services/:slug", destination: "/author-notes/:slug", permanent: true },
      { source: "/team", destination: "/lineage", permanent: true },
      { source: "/family-tree", destination: "/lineage", permanent: true },
      { source: "/journal", destination: "/ebook-order", permanent: true },
      { source: "/journal/:slug", destination: "/ebook-order/:slug", permanent: true },
      { source: "/admin/services", destination: "/admin/author-notes", permanent: false },
      { source: "/admin/team", destination: "/admin/lineage", permanent: false },
      { source: "/admin/family-tree", destination: "/admin/lineage", permanent: false },
      { source: "/admin/journal", destination: "/admin/ebook-order", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
