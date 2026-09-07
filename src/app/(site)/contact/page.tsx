import type { Metadata } from "next";

import { ContactForm } from "@/components/forms/contact-form";
import { PageHeader } from "@/components/marketing/page-header";
import { getSiteSettings } from "@/lib/content";
import { generatePageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("contact", "/contact", {
    title: "Contact",
    description:
      "Reach Peter Douet and the USAGWP team about the book, talks, readings, research and press enquiries.",
  });
}

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const telHref = settings.phone.replace(/[^\d+]/g, "");

  return (
    <>
      <PageHeader
        title="Get in touch"
        intro="Questions about the book, requests for talks and readings, research enquiries and press. Write to us and we will reply directly."
      />

      <section className="bg-bg py-16 md:py-20">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-5 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-10">
          <div>
            <h2 className="font-display text-2xl text-fg">Direct contact</h2>
            <dl className="mt-6 space-y-5 border-t border-line pt-6">
              <div>
                <dt className="text-sm text-fg-muted">Author</dt>
                <dd className="mt-1 text-[1.0625rem] text-fg">Peter Douet</dd>
              </div>
              {settings.email ? (
                <div>
                  <dt className="text-sm text-fg-muted">Email</dt>
                  <dd className="mt-1">
                    <a
                      href={`mailto:${settings.email}`}
                      className="text-[1.0625rem] text-fg underline-offset-4 hover:text-accent hover:underline"
                    >
                      {settings.email}
                    </a>
                  </dd>
                </div>
              ) : null}
              {settings.phone ? (
                <div>
                  <dt className="text-sm text-fg-muted">Phone</dt>
                  <dd className="mt-1">
                    <a
                      href={`tel:${telHref}`}
                      className="text-[1.0625rem] text-fg underline-offset-4 hover:text-accent hover:underline"
                    >
                      {settings.phone}
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>

          <div>
            <h2 className="font-display text-2xl text-fg">Send a message</h2>
            <div className="mt-6 border-t border-line pt-6">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
