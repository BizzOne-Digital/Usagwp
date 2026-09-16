import type { Metadata, Viewport } from "next";
import { EB_Garamond, Geist } from "next/font/google";

import "./globals.css";
import { getSiteUrl } from "@/lib/seo";

/**
 * EB Garamond carries the display voice. A serif is justified here because the
 * brief is a genuine publication: a 19th-century biography where the type needs
 * to read as a book, not as a product page. Geist handles body and UI so the
 * page stays contemporary and highly legible at small sizes.
 */
const displaySerif = EB_Garamond({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-eb-garamond",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const sans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "One Thread in the Fabric of Freedom | Edmond Kelly",
    template: "%s | Edmond Kelly",
  },
  description:
    "The true story of Reverend Edmond Kelly, born into slavery in 1817, who preached across America, England and Ireland to buy his family out of bondage. A forthcoming book by Peter Douet.",
  applicationName: "Edmond Kelly",
  authors: [{ name: "Peter Douet" }],
  keywords: [
    "Edmond Kelly",
    "Reverend Edmond Kelly",
    "One Thread in the Fabric of Freedom",
    "Peter Douet",
    "historical nonfiction",
    "Black history",
    "American history",
    "slavery narrative",
    "historical biography",
    "family history",
  ],
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    siteName: "Edmond Kelly",
    locale: "en_US",
    url: `${siteUrl}/`,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f3ef" },
    { media: "(prefers-color-scheme: dark)", color: "#10141b" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${displaySerif.variable} ${sans.variable}`}>
      <body suppressHydrationWarning className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
