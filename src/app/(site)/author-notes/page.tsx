import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { EmptyState, PageHeader } from "@/components/marketing/page-header";
import { Reveal } from "@/components/marketing/reveal";
import { getActiveServices } from "@/lib/content";
import { generatePageMetadata } from "@/lib/seo";
import { resolveImageUrl } from "@/lib/uploads/resolve-image-url";
import { buttonClasses } from "@/lib/button-classes";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("services", "/author-notes", {
    title: "Author Notes",
    description:
      "Notes from Peter Douet on the research behind One Thread in the Fabric of Freedom: the records, the archives and the people traced along the way.",
  });
}

export default async function AuthorNotesPage() {
  const services = await getActiveServices();

  return (
    <>
      <PageHeader
        title="Author Notes"
        intro="Notes from the author on the research behind the book. What the records showed, what they did not, and what each discovery changed."
      />

      <section className="bg-bg py-16 md:py-20">
        <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
          {services.length === 0 ? (
            <EmptyState
              title="No author notes have been published yet"
              body="Notes will appear here as they are written. If you have a question about the research in the meantime, write to us."
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
            <div className="grid gap-x-10 gap-y-12 border-t border-line pt-12 md:grid-cols-2">
              {services.map((service, index) => {
                const image = resolveImageUrl(service.image);
                return (
                  <Reveal key={service.id} delay={Math.min(index, 4) * 0.05}>
                    <article>
                      {/* No fixed aspect and no cover-crop: a portrait book cover
                          in a 16:10 box lost its top and bottom. The file decides
                          the ratio. */}
                      {image ? (
                        <Image
                          src={image}
                          alt={service.title}
                          width={0}
                          height={0}
                          sizes="(max-width: 768px) 100vw, 44vw"
                          className="mb-6 h-auto w-full rounded-sm"
                        />
                      ) : null}
                      <h2 className="font-display text-[1.75rem] leading-tight">
                        <Link
                          href={`/author-notes/${service.slug}`}
                          className="transition-colors hover:text-accent"
                        >
                          {service.title}
                        </Link>
                      </h2>
                      {service.shortDescription ? (
                        <p className="mt-3 max-w-[48ch] text-[1.0625rem] leading-relaxed text-fg-soft">
                          {service.shortDescription}
                        </p>
                      ) : null}
                      <Link
                        href={`/author-notes/${service.slug}`}
                        className="mt-4 inline-block text-sm font-medium text-accent underline-offset-4 hover:underline"
                      >
                        Read this note
                      </Link>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
