import type { Metadata } from "next";

import { PageHeader } from "@/components/marketing/page-header";
import { getSiteSettings } from "@/lib/content";
import { generatePageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("privacy", "/privacy", {
    title: "Privacy Policy",
    description: "How Edmond Kelly handles the information you give us through this website.",
  });
}

export default async function PrivacyPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <PageHeader
        title="Privacy Policy"
        intro="This page explains what this website collects, why, and how to have it removed."
      />

      <section className="bg-bg py-16 md:py-20">
        <div className="mx-auto max-w-[46rem] space-y-10 px-5 lg:px-10">
          <Block title="What we collect">
            <p>
              We collect only what you type into a form on this site. That is the email
              address, and optionally the first name, you give us when you ask to be told the
              book is available, and the name, email address, phone number, subject and
              message you send through the contact form.
            </p>
            <p>
              We do not buy contact details, and we do not collect information about you from
              other sources.
            </p>
          </Block>

          <Block title="Why we hold it">
            <p>
              Email addresses on the notification list are used for one purpose: to tell you
              when the book is published. Contact form submissions are used to reply to you.
            </p>
            <p>We do not sell or rent your information to anyone.</p>
          </Block>

          <Block title="How long we keep it">
            <p>
              Notification list entries are kept until the book has been published and
              announced, or until you ask to be removed, whichever comes first. Contact
              messages are kept while the enquiry is open and for a reasonable period after.
            </p>
          </Block>

          <Block title="Cookies">
            <p>
              This website sets no advertising or tracking cookies. A single cookie is used to
              keep the site administrator signed in to the content management area, and it is
              set only after an administrator signs in.
            </p>
          </Block>

          <Block title="Your choices">
            <p>
              You can ask us at any time to tell you what we hold about you, to correct it, or
              to delete it. Write to{" "}
              {settings.email ? (
                <a
                  href={`mailto:${settings.email}`}
                  className="text-fg underline underline-offset-4 hover:text-accent"
                >
                  {settings.email}
                </a>
              ) : (
                "us"
              )}{" "}
              and we will act on it.
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
