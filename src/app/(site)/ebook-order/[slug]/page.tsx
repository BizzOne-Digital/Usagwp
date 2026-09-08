import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getPostBySlug, getPublishedPosts } from "@/lib/content";
import { formatLongDate, toParagraphs } from "@/lib/format";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { resolveImageUrl } from "@/lib/uploads/resolve-image-url";
import { buttonClasses } from "@/lib/button-classes";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    // notFound() from a page cannot set the status in this Next version, so the
    // fallback metadata carries noindex. See README "A note on 404 status".
    return buildMetadata({
      title: "Entry not found",
      description: "",
      path: `/ebook-order/${slug}`,
      noIndex: true,
    });
  }
  return buildMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    path: `/ebook-order/${post.slug}`,
    image: post.ogImage || post.coverImage || null,
    type: "article",
  });
}

export default async function OrderEditionPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const cover = resolveImageUrl(post.coverImage);
  const paragraphs = toParagraphs(post.body);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    url: absoluteUrl(`/ebook-order/${post.slug}`),
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    ...(post.coverImage ? { image: [absoluteUrl(post.coverImage)] } : {}),
    ...(post.author ? { author: { "@type": "Person", name: post.author } } : {}),
    publisher: { "@id": `${absoluteUrl("/").replace(/\/$/, "")}/#organization` },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="bg-bg">
        <header className="border-b border-line">
          <div className="mx-auto max-w-[46rem] px-5 pb-12 pt-14 md:pt-20 lg:px-0">
            <Link
              href="/ebook-order"
              className="text-sm text-fg-muted underline-offset-4 hover:text-fg hover:underline"
            >
              Back to eBook/Paperback Order
            </Link>
            <h1 className="mt-6 font-display text-[clamp(2.1rem,5vw,3.5rem)] font-medium leading-[1.06] tracking-[-0.02em] text-balance">
              {post.title}
            </h1>
            <p className="mt-5 text-sm text-fg-muted">
              {post.author || null}
              {post.author && post.publishedAt ? ". " : null}
              {post.publishedAt ? `Available ${formatLongDate(post.publishedAt)}` : null}
            </p>
          </div>
        </header>

        <div className="mx-auto max-w-[46rem] px-5 py-14 lg:px-0">
          {cover ? (
            <div className="relative mb-10 aspect-[16/9] w-full overflow-hidden rounded-sm">
              <Image
                src={cover}
                alt={post.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 46rem"
                className="object-cover"
              />
            </div>
          ) : null}

          <div className="space-y-5 text-[1.0625rem] leading-[1.75] text-fg-soft">
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {post.orderUrl ? (
            <div className="mt-10">
              <a
                href={post.orderUrl}
                rel="noopener noreferrer"
                target="_blank"
                className={buttonClasses("primary", "lg")}
              >
                {post.orderLabel || "Order this edition"}
              </a>
            </div>
          ) : null}
        </div>
      </article>
    </>
  );
}
