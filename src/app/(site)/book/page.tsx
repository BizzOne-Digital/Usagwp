import type { Metadata } from "next";

import { BookPanel } from "@/components/book/book-panel";
import { PageHeader } from "@/components/marketing/page-header";
import { Reveal } from "@/components/marketing/reveal";
import { StayUpdated } from "@/components/marketing/stay-updated";
import { Timeline } from "@/components/marketing/timeline";
import { getBook, isForSale } from "@/lib/content";
import { toParagraphs } from "@/lib/format";
import { absoluteUrl, generatePageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const book = await getBook();
  return generatePageMetadata("book", "/book", {
    title: book.seoTitle || book.title,
    description:
      book.seoDescription ||
      book.description ||
      "The forthcoming book by Peter Douet telling the true story of Reverend Edmond Kelly.",
    image: book.ogImage || book.coverImage || null,
  });
}

export default async function BookPage() {
  const book = await getBook();
  const forSale = isForSale(book);
  const paragraphs = toParagraphs(book.longDescription);

  /**
   * Product markup is emitted only when the book is genuinely on sale. While it
   * is unpublished the page describes a Book, with no offer, no price and no
   * availability, because inventing those would be false structured data.
   */
  const jsonLd = forSale
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: book.title,
        description: book.description,
        url: absoluteUrl("/book"),
        ...(book.coverImage ? { image: [absoluteUrl(book.coverImage)] } : {}),
        ...(book.isbn ? { gtin13: book.isbn } : {}),
        brand: { "@type": "Organization", name: "USAGWP" },
        offers: {
          "@type": "Offer",
          url: book.purchaseUrl || absoluteUrl("/book"),
          availability: "https://schema.org/InStock",
          ...(book.price !== null
            ? { price: String(book.price), priceCurrency: book.currency }
            : {}),
        },
      }
    : {
        "@context": "https://schema.org",
        "@type": "Book",
        name: book.title,
        url: absoluteUrl("/book"),
        description: book.description,
        author: { "@type": "Person", name: book.author },
        inLanguage: "en",
      };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader
        title={book.title}
        intro={book.description}
      />

      <section className="border-b border-line bg-bg py-16 md:py-20">
        <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
          <div className="mx-auto max-w-[46rem] space-y-5 text-[1.0625rem] leading-[1.75] text-fg-soft">
            {paragraphs.map((paragraph, index) => (
              <Reveal key={index} delay={Math.min(index, 3) * 0.06}>
                <p>{paragraph}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <BookPanel book={book} />
      <Timeline />
      <StayUpdated status={book.publicationStatus} />
    </>
  );
}
