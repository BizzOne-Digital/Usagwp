import Link from "next/link";

import { BookCover } from "@/components/book/book-cover";
import { Reveal } from "@/components/marketing/reveal";
import { isForSale, type BookView } from "@/lib/content";
import { formatPrice, formatLongDate } from "@/lib/format";
import { buttonClasses } from "@/lib/button-classes";

/**
 * The book presentation. Every commerce affordance (price, ISBN, buy links,
 * publication date) is gated on the CMS publication status, so switching the
 * book to "Published" in the admin turns this section into a product panel with
 * no code change and no redesign.
 */
export function BookPanel({ book }: { book: BookView }) {
  const forSale = isForSale(book);
  const published = book.publicationStatus === "published";

  const details: { label: string; value: string }[] = [];
  if (published && book.publicationDate) {
    details.push({ label: "Published", value: formatLongDate(book.publicationDate) });
  }
  if (published && book.isbn) details.push({ label: "ISBN", value: book.isbn });
  if (published && book.format) details.push({ label: "Format", value: book.format });
  if (published && book.pageCount) details.push({ label: "Pages", value: String(book.pageCount) });

  const retailers = [
    book.amazonUrl ? { label: "Amazon", url: book.amazonUrl } : null,
    ...book.retailers,
  ].filter((entry): entry is { label: string; url: string } => Boolean(entry));

  return (
    <section className="border-b border-line bg-bg-deep py-20 md:py-28">
      <div className="mx-auto grid max-w-[1400px] items-center gap-12 px-5 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-10">
        <Reveal className="mx-auto w-full max-w-[26rem] lg:max-w-none">
          <BookCover
            src={book.coverImage}
            alt={book.coverAlt}
            title={book.title}
            author={book.author}
            sizes="(max-width: 1024px) 85vw, 30vw"
          />
        </Reveal>

        <Reveal delay={0.08}>
          <h2 className="max-w-[16ch] font-display text-[clamp(2rem,4.4vw,3.25rem)] font-medium leading-[1.08] tracking-[-0.015em] text-balance">
            {book.title}
          </h2>
          <p className="mt-3 text-[0.9375rem] text-fg-muted">
            {book.subtitle ? `${book.subtitle}. ` : ""}Written by {book.author}.
          </p>

          <p className="mt-7 max-w-[52ch] text-[1.0625rem] leading-[1.75] text-fg-soft">
            {book.description}
          </p>

          {forSale && book.price !== null ? (
            <p className="mt-7 font-display text-[2rem] leading-none text-fg">
              {formatPrice(book.price, book.currency)}
            </p>
          ) : null}

          {details.length > 0 ? (
            <dl className="mt-7 grid max-w-md grid-cols-2 gap-x-8 gap-y-3 border-t border-line pt-6 text-sm">
              {details.map((detail) => (
                <div key={detail.label}>
                  <dt className="text-fg-muted">{detail.label}</dt>
                  <dd className="mt-0.5 text-fg">{detail.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          <div className="mt-9 flex flex-wrap items-center gap-3">
            {forSale ? (
              <>
                {book.purchaseUrl ? (
                  <a
                    href={book.purchaseUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                    className={buttonClasses("primary", "lg", "h-13")}
                  >
                    Buy the Book
                  </a>
                ) : null}
                {retailers.map((retailer) => (
                  <a
                    key={retailer.url}
                    href={retailer.url}
                    rel="noopener noreferrer"
                    target="_blank"
                    className={buttonClasses("secondary", "lg", "h-13")}
                  >
                    {retailer.label}
                  </a>
                ))}
              </>
            ) : (
              <>
                <Link
                  href="/#stay-updated"
                  className={buttonClasses("primary", "lg", "h-13")}
                >
                  Stay Updated
                </Link>
                <p className="text-sm text-fg-muted">
                  The book is in its final stage before printing.
                </p>
              </>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
