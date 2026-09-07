import type { Metadata } from "next";

import { PageHeader } from "@/components/marketing/page-header";
import { getSiteSettings } from "@/lib/content";
import { generatePageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("terms", "/terms", {
    title: "Terms",
    description: "The terms that apply to your use of the USAGWP website.",
  });
}

export default async function TermsPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <PageHeader
        title="Terms"
        intro="The terms below apply to your use of this website."
      />

      <section className="bg-bg py-16 md:py-20">
        <div className="mx-auto max-w-[46rem] space-y-10 px-5 lg:px-10">
          <Block title="Using this site">
            <p>
              You are welcome to read, quote briefly with attribution, and share links to
              anything published here. You may not republish the site&rsquo;s text or images in
              full, or use them commercially, without written permission.
            </p>
          </Block>

          <Block title="The book and its contents">
            <p>
              One Thread in the Fabric of Freedom and the material on this site are the
              copyright of their author. The historical account is presented as researched. If
              you believe something here is inaccurate, tell us and we will look at it.
            </p>
          </Block>

          <Block title="Availability">
            <p>
              The book is not yet published. Nothing on this site is an offer to sell it, and
              no order can be placed until publication is announced. Details such as price,
              format and publication date will be published here when they are settled.
            </p>
          </Block>

          <Block title="Links to other sites">
            <p>
              Where this site links to a retailer or another organisation, that site has its
              own terms and privacy practices, and we are not responsible for them.
            </p>
          </Block>

          <Block title="Contact">
            <p>
              Questions about these terms can be sent to{" "}
              {settings.email ? (
                <a
                  href={`mailto:${settings.email}`}
                  className="text-fg underline underline-offset-4 hover:text-accent"
                >
                  {settings.email}
                </a>
              ) : (
                "the address on our contact page"
              )}
              .
            </p>
          </Block>
        </div>
      </section>
    </>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-2xl text-fg">{title}</h2>
      <div className="mt-4 space-y-4 text-[1.0625rem] leading-[1.75] text-fg-soft">
        {children}
      </div>
    </div>
  );
}
