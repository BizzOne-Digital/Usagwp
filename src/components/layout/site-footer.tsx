import Link from "next/link";

import { BrandMark } from "@/components/ui/brand-mark";
import type { SiteSettingsView } from "@/lib/content";

const SITE_LINKS = [
  { href: "/book", label: "The Book" },
  { href: "/about", label: "About" },
  { href: "/family-line", label: "LaTanya D. Kelly-Douet Family Line" },
  { href: "/author-notes", label: "Author Notes" },
  { href: "/ebook-order", label: "eBook/Paperback Order" },
  { href: "/faq", label: "Questions" },
] as const;

export function SiteFooter({ settings }: { settings: SiteSettingsView }) {
  const year = new Date().getFullYear();
  const telHref = settings.phone.replace(/[^\d+]/g, "");

  return (
    <footer className="bg-indigo-900 text-fg-inverse">
      <div className="mx-auto max-w-[1400px] px-5 py-14 lg:px-10 lg:py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <BrandMark className="h-7 w-7 text-fg-inverse" />
              <span className="font-display text-lg font-semibold tracking-[0.16em]">
                {settings.siteName}
              </span>
            </div>
            <p className="mt-4 max-w-sm font-display text-xl leading-snug text-fg-inverse">
              {settings.tagline}
            </p>
            {settings.footerText ? (
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-fg-inverse-muted">
                {settings.footerText}
              </p>
            ) : null}
          </div>

          <nav aria-label="Footer">
            <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-fg-inverse-muted">
              Explore
            </h2>
            <ul className="mt-4 space-y-2.5">
              {SITE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-fg-inverse-muted transition-colors hover:text-fg-inverse"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-fg-inverse-muted">
              Contact
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li className="text-fg-inverse">Peter Douet</li>
              {settings.email ? (
                <li>
                  <a
                    href={`mailto:${settings.email}`}
                    className="text-fg-inverse-muted transition-colors hover:text-fg-inverse"
                  >
                    {settings.email}
                  </a>
                </li>
              ) : null}
              {settings.phone ? (
                <li>
                  <a
                    href={`tel:${telHref}`}
                    className="text-fg-inverse-muted transition-colors hover:text-fg-inverse"
                  >
                    {settings.phone}
                  </a>
                </li>
              ) : null}
            </ul>

            {settings.socialLinks.length > 0 ? (
              <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
                {settings.socialLinks.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      rel="noopener noreferrer"
                      target="_blank"
                      className="text-sm text-fg-inverse-muted underline-offset-4 transition-colors hover:text-fg-inverse hover:underline"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-line-inverse pt-6 text-xs text-fg-inverse-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {year} {settings.siteName}. All rights reserved.
          </p>
          <ul className="flex gap-6">
            <li>
              <Link href="/privacy" className="transition-colors hover:text-fg-inverse">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="transition-colors hover:text-fg-inverse">
                Terms
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
