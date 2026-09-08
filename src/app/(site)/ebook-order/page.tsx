import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { EmptyState, PageHeader } from "@/components/marketing/page-header";
import { Reveal } from "@/components/marketing/reveal";
import { getPublishedPosts } from "@/lib/content";
import { formatShortDate } from "@/lib/format";
import { generatePageMetadata } from "@/lib/seo";
import { resolveImageUrl } from "@/lib/uploads/resolve-image-url";
import { buttonClasses } from "@/lib/button-classes";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("journal", "/ebook-order", {
    title: "eBook/Paperback Order",
    description:
      "Order One Thread in the Fabric of Freedom by Peter Douet as an eBook or a paperback.",
  });
}

export default async function EbookOrderPage() {
  const posts = await getPublishedPosts();

  return (
    <>
      <PageHeader
        title="eBook/Paperback Order"
        intro="Order One Thread in the Fabric of Freedom. Every edition available is listed below, with what it includes and where to buy it."
      />

      <section className="bg-bg py-16 md:py-20">
        <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
          {posts.length === 0 ? (
            <EmptyState
              title="Ordering is not open yet"
              body="The book cannot be ordered yet. Join the list and we will tell you the moment it can be."
              action={
                <Link
                  href="/#stay-updated"
                  className={buttonClasses("primary", "md")}
                >
                  Stay Updated
                </Link>
              }
            />
          ) : (
            <ul className="mx-auto max-w-[52rem] divide-y divide-line border-t border-line">
              {posts.map((post, index) => {
                const cover = resolveImageUrl(post.coverImage);
                return (
                  <Reveal as="li" key={post.id} delay={Math.min(index, 4) * 0.05}>
                    <article className="grid gap-6 py-9 sm:grid-cols-[1fr_12rem] sm:gap-10">
                      <div>
                        {post.publishedAt ? (
                          <p className="text-sm text-fg-muted">
                            Available {formatShortDate(post.publishedAt)}
                          </p>
                        ) : null}
                        <h2 className="mt-2 font-display text-[1.75rem] leading-tight">
                          <Link
                            href={`/ebook-order/${post.slug}`}
                            className="transition-colors hover:text-accent"
                          >
                            {post.title}
                          </Link>
                        </h2>
                        {post.excerpt ? (
                          <p className="mt-3 max-w-[52ch] text-[1.0625rem] leading-relaxed text-fg-soft">
                            {post.excerpt}
                          </p>
                        ) : null}
                        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
                          {post.orderUrl ? (
                            <a
                              href={post.orderUrl}
                              rel="noopener noreferrer"
                              target="_blank"
                              className={buttonClasses("primary", "md")}
                            >
                              {post.orderLabel || "Order this edition"}
                            </a>
                          ) : null}
                          <Link
                            href={`/ebook-order/${post.slug}`}
                            className="text-sm font-medium text-accent underline-offset-4 hover:underline"
                          >
                            Full details
                          </Link>
                        </div>
                      </div>
                      {cover ? (
                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm sm:order-last">
                          <Image
                            src={cover}
                            alt={post.title}
                            fill
                            sizes="(max-width: 640px) 100vw, 12rem"
                            className="object-cover"
                          />
                        </div>
                      ) : null}
                    </article>
                  </Reveal>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
