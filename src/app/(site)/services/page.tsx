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
  return generatePageMetadata("services", "/services", {
    title: "Services",
    description:
      "Talks, readings and historical research work offered by USAGWP around the story of Reverend Edmond Kelly.",
  });
}

export default async function ServicesPage() {
  const services = await getActiveServices();

  return (
    <>
      <PageHeader
        title="Working with us"
        intro="Anything listed here is something we actively offer. If nothing is listed, nothing is currently being offered, and the contact page is the right place to start."
      />

      <section className="bg-bg py-16 md:py-20">
        <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
          {services.length === 0 ? (
            <EmptyState
              title="No services are listed at the moment"
              body="Talks, readings and research enquiries are still welcome. Write to us and we will tell you what is possible."
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
                      {image ? (
                        <div className="relative mb-6 aspect-[16/10] w-full overflow-hidden rounded-sm">
                          <Image
                            src={image}
                            alt={service.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 44vw"
                            className="object-cover"
                          />
                        </div>
                      ) : null}
                      <h2 className="font-display text-[1.75rem] leading-tight">
                        <Link
                          href={`/services/${service.slug}`}
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
                        href={`/services/${service.slug}`}
                        className="mt-4 inline-block text-sm font-medium text-accent underline-offset-4 hover:underline"
                      >
                        Read more about {service.title}
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
