import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PageHeader } from "@/components/marketing/page-header";
import { getActiveServices, getServiceBySlug } from "@/lib/content";
import { toParagraphs } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";
import { resolveImageUrl } from "@/lib/uploads/resolve-image-url";
import { buttonClasses } from "@/lib/button-classes";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const services = await getActiveServices();
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    return buildMetadata({
      title: "Service not found",
      description: "",
      path: `/services/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: service.seoTitle || service.title,
    description: service.seoDescription || service.shortDescription,
    path: `/services/${service.slug}`,
    image: service.image || null,
  });
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) notFound();

  const image = resolveImageUrl(service.image);
  const paragraphs = toParagraphs(service.longDescription);

  return (
    <>
      <PageHeader title={service.title} intro={service.shortDescription}>
        <Link
          href="/services"
          className="mt-8 inline-block text-sm text-fg-muted underline-offset-4 hover:text-fg hover:underline"
        >
          Back to services
        </Link>
      </PageHeader>

      <article className="bg-bg py-16 md:py-20">
        <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
          {image ? (
            <div className="relative mx-auto mb-12 aspect-[16/9] w-full max-w-[56rem] overflow-hidden rounded-sm">
              <Image
                src={image}
                alt={service.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 56rem"
                className="object-cover"
              />
            </div>
          ) : null}

          <div className="mx-auto max-w-[46rem] space-y-5 text-[1.0625rem] leading-[1.75] text-fg-soft">
            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
            ) : (
              <p>{service.shortDescription}</p>
            )}
          </div>

          <div className="mx-auto mt-12 max-w-[46rem]">
            {service.ctaUrl && service.ctaLabel ? (
              <a
                href={service.ctaUrl}
                rel="noopener noreferrer"
                target="_blank"
                className={buttonClasses("primary", "lg")}
              >
                {service.ctaLabel}
              </a>
            ) : (
              <Link
                href="/contact"
                className={buttonClasses("primary", "lg")}
              >
                Contact us
              </Link>
            )}
          </div>
        </div>
      </article>
    </>
  );
}
