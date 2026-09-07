import Link from "next/link";

import { BookCover } from "@/components/book/book-cover";
import type { BookView } from "@/lib/content";
import { buttonClasses } from "@/lib/button-classes";

/**
 * Asymmetric split hero. The cover is the anchor on the right, the claim sits
 * left. Four text elements total: status line, headline, subtext, CTAs.
 */
export function Hero({ book }: { book: BookView }) {
  const isComingSoon = book.publicationStatus === "coming-soon";

  return (
    <section className="relative overflow-hidden border-b border-line bg-bg">
      <div className="mx-auto grid max-w-[1400px] items-center gap-12 px-5 pb-16 pt-12 md:pb-20 md:pt-14 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16 lg:px-10 lg:pb-20 lg:pt-16">
        <div>
          {isComingSoon ? (
            <p className="mb-6 flex items-center gap-3 font-sans text-xs font-medium uppercase tracking-[0.2em] text-fg-muted">
              <span aria-hidden className="h-px w-8 bg-accent" />
              A new book by {book.author}
            </p>
          ) : null}

          <h1 className="max-w-[15ch] font-display text-[clamp(2.6rem,7vw,5.25rem)] font-medium leading-[1.02] tracking-[-0.02em] text-balance text-fg">
            One Thread in the Fabric of Freedom
          </h1>

          <p className="mt-7 max-w-[46ch] text-[1.0625rem] leading-relaxed text-fg-soft text-pretty">
            The true story of Reverend Edmond Kelly, who was born into slavery in 1817 and
            preached across three countries to buy his family out of bondage.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/book"
              className={buttonClasses("primary", "lg", "h-13")}
            >
              Read the Story
            </Link>
            <Link
              href="#stay-updated"
              className={buttonClasses("secondary", "lg", "h-13")}
            >
              Stay Updated
            </Link>
          </div>
        </div>

        {/* The cover is capped so the whole hero stays inside the first
            viewport at common laptop heights. */}
        <div className="relative mx-auto w-full max-w-[16rem] sm:max-w-[18rem] lg:mr-0 lg:max-w-[20rem]">
          {/* The thread motif, introduced here and carried through the page. */}
          <span
            aria-hidden
            className="thread-rule absolute -top-10 bottom-[-2.5rem] left-1/2 hidden w-px opacity-45 lg:block"
          />
          <div className="relative">
            <BookCover
              src={book.coverImage}
              alt={book.coverAlt}
              title={book.title}
              author={book.author}
              priority
              sizes="(max-width: 1024px) 60vw, 30vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
