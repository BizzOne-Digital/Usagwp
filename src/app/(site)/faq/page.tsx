import Link from "next/link";
import type { Metadata } from "next";

import { EmptyState, PageHeader } from "@/components/marketing/page-header";
import { getPublishedFaqs } from "@/lib/content";
import { generatePageMetadata } from "@/lib/seo";
import { buttonClasses } from "@/lib/button-classes";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("faq", "/faq", {
    title: "Questions",
    description:
      "Answers to common questions about One Thread in the Fabric of Freedom and the story of Reverend Edmond Kelly.",
  });
}

export default async function FaqPage() {
  const faqs = await getPublishedFaqs();

  // FAQPage markup is emitted only when there are real published answers.
  const jsonLd =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }
      : null;

  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}

      <PageHeader
        title="Questions"
        intro="If what you are looking for is not answered here, write to us."
      />

      <section className="bg-bg py-16 md:py-20">
        <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
          {faqs.length === 0 ? (
            <EmptyState
              title="No questions have been published yet"
              body="This page fills up as readers start asking. Until then, the contact page reaches us directly."
              action={
                <Link
                  href="/contact"
                  className={buttonClasses("primary", "md")}
                >
                  Contact us
                </Link>
              }
            />
          ) : (
            <dl className="mx-auto max-w-[46rem] divide-y divide-line border-t border-line">
              {faqs.map((faq) => (
                <div key={faq.id} className="py-8">
                  <dt className="font-display text-[1.5rem] leading-snug text-fg">
                    {faq.question}
                  </dt>
                  <dd className="mt-3 text-[1.0625rem] leading-[1.75] text-fg-soft">
                    {faq.answer}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>
    </>
  );
}
