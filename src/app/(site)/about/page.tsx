import type { Metadata } from "next";

import { PageHeader } from "@/components/marketing/page-header";
import { Reveal } from "@/components/marketing/reveal";
import { StayUpdated } from "@/components/marketing/stay-updated";
import { getBook } from "@/lib/content";
import { generatePageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("about", "/about", {
    title: "About the project",
    description:
      "Edmond Kelly exists to preserve the record of Reverend Edmond Kelly, born into slavery in Columbia, Tennessee, in 1817, and to bring his story to readers through the work of Peter Douet and his late wife LaTanya D. Kelly-Douet, Edmond Kelly's descendant.",
  });
}

export default async function AboutPage() {
  const book = await getBook();

  return (
    <>
      <PageHeader
        title="Keeping the record of one life"
        intro="Edmond Kelly exists for a single purpose: to preserve the story of Reverend Edmond Kelly and to put it in front of readers who have never heard it."
      />

      <section className="border-b border-line bg-bg py-16 md:py-24">
        <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
          <div className="mx-auto max-w-[46rem] space-y-12">
            <Reveal>
              <h2 className="font-display text-[clamp(1.65rem,3.4vw,2.35rem)] font-medium leading-tight">
                Why this story matters
              </h2>
              <div className="mt-5 space-y-5 text-[1.0625rem] leading-[1.75] text-fg-soft">
                <p>
                  Most people held in slavery in the United States left no written record of
                  their own. Names survive in ledgers and bills of sale, if they survive at
                  all. Edmond Kelly is one of the few whose life can be followed, and following
                  it changes what the period looks like.
                </p>
                <p>
                  He was born owned. He learned to read when reading was forbidden to him. He
                  was ordained when ordination was closed to him. And when he escaped, he did
                  not disappear into safety: he went back to work, in public, in front of
                  congregations on two continents, until he had raised the price set against
                  his own family.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.06}>
              <h2 className="font-display text-[clamp(1.65rem,3.4vw,2.35rem)] font-medium leading-tight">
                The family connection
              </h2>
              <div className="mt-5 space-y-5 text-[1.0625rem] leading-[1.75] text-fg-soft">
                <p>
                  {book.author} is the author and compiler of {book.title}. Reverend Edmond
                  Kelly is an ancestor of Peter&rsquo;s late wife, LaTanya D. Kelly-Douet.
                  After LaTanya&rsquo;s passing in 2020, Peter continued the work of preserving
                  her family&rsquo;s history and Edmond Kelly&rsquo;s remarkable legacy for
                  their children, the Kelly family, and future generations.
                </p>
                <p>
                  That is what separates it from a study written at a distance: the line it
                  traces did not end.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <h2 className="font-display text-[clamp(1.65rem,3.4vw,2.35rem)] font-medium leading-tight">
                What we are doing with it
              </h2>
              <div className="mt-5 space-y-5 text-[1.0625rem] leading-[1.75] text-fg-soft">
                <p>
                  The immediate work is the book. {book.title} is a biographical and historical
                  narrative.{" "}
                  {book.publicationStatus === "published"
                    ? "It is published and available now."
                    : "It is in its final stage before printing."}
                </p>
                <p>
                  Beyond publication, the aim is straightforward. Make the record available.
                  Keep it accurate. Put it where readers, students, historians and families
                  tracing their own lines can find it.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <StayUpdated status={book.publicationStatus} />
    </>
  );
}
