import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { RevealController } from "@/components/marketing/reveal-controller";
import { getSiteSettings } from "@/lib/content";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

/**
 * Organization and WebSite JSON-LD are declared once, here, so no page can
 * duplicate them. LocalBusiness is deliberately omitted: USAGWP has no public
 * premises or opening hours, and claiming otherwise would be misleading markup.
 * Canonical URLs are always set per page, never here.
 */
/**
 * CMS-driven pages are revalidated on a timer so content edits appear without a
 * redeploy. Admin writes additionally call revalidatePath for an instant update.
 *
 * Note: no loading.tsx is placed on this segment. A loading boundary makes the
 * route stream, which flushes a 200 before notFound() can run, turning every
 * missing or unpublished page into a soft 404. These pages are statically
 * rendered and fast, so the boundary would buy nothing and cost correctness.
 */
export const revalidate = 300;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  const jsonLd = [organizationJsonLd(settings), websiteJsonLd(settings.siteName)];

  return (
    <>
      <script
        type="application/ld+json"
        // Serialised server-side from our own data, never from user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <a
        href="#main"
        className="sr-only-focusable absolute left-4 top-4 z-[70] rounded-sm bg-brand px-4 py-2 text-sm font-medium text-brand-contrast"
      >
        Skip to content
      </a>
      <RevealController />
      <div aria-hidden className="grain-overlay" />
      <div className="flex min-h-[100dvh] flex-col">
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter settings={settings} />
      </div>
    </>
  );
}
