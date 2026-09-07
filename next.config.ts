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
