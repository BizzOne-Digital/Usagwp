import Link from "next/link";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getSiteSettings } from "@/lib/content";
import { buttonClasses } from "@/lib/button-classes";

/**
 * This lives at the root rather than inside the (site) group on purpose. A
 * not-found boundary nested in a route group renders the right page but replies
 * 200, which is a soft 404: search engines index the URL as a real page, and an
 * unpublished draft's address would answer successfully. Only the root boundary
 * sets the 404 status, so the site chrome is composed here by hand.
 */
export default async function NotFound() {
  const settings = await getSiteSettings();

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <section className="bg-bg py-28 md:py-36">
          <div className="mx-auto max-w-[46rem] px-5 lg:px-10">
            <span aria-hidden className="block h-12 w-px bg-accent" />
            <h1 className="mt-8 font-display text-[clamp(2.2rem,5vw,3.5rem)] font-medium leading-tight">
              That page is not here
            </h1>
            <p className="mt-5 max-w-[48ch] text-[1.0625rem] leading-relaxed text-fg-soft">
              The link may be out of date, or the page may have moved. The book, the story and
              the contact details are all still where you would expect them.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/"
                className={buttonClasses("primary", "lg", "px-6")}
              >
                Back to the home page
              </Link>
              <Link
                href="/book"
                className={buttonClasses("secondary", "lg", "px-6")}
              >
                Read the Story
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}
