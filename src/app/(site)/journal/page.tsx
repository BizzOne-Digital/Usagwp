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
  return generatePageMetadata("journal", "/journal", {
    title: "Journal",
    description:
      "Notes on the research, the archive and the making of One Thread in the Fabric of Freedom.",
  });
}

export default async function JournalPage() {
  const posts = await getPublishedPosts();

  return (
    <>
      <PageHeader
        title="Journal"
        intro="Notes from the research and the road to publication."
      />

      <section className="bg-bg py-16 md:py-20">
        <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
          {posts.length === 0 ? (
            <EmptyState
              title="Nothing has been published here yet"
              body="Research notes and updates will appear here. Join the list and we will tell you when the book is available."
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
                            {formatShortDate(post.publishedAt)}
                          </p>
                        ) : null}
                        <h2 className="mt-2 font-display text-[1.75rem] leading-tight">
                          <Link
                            href={`/journal/${post.slug}`}
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
