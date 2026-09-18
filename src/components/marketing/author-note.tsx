import { Reveal } from "@/components/marketing/reveal";

/**
 * Positions Peter Douet as the one continuing his late wife’s work. Deliberately
 * short: no biography is invented here. Once the client adds a photo and bio in
 * the CMS Family Line section, that page carries the fuller account.
 */
export function AuthorNote({ author }: { author: string }) {
  return (
    <section className="border-b border-line bg-bg py-20 md:py-28">
      <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
        <div className="mx-auto max-w-[44rem] border-l-2 border-accent pl-7 md:pl-10">
          <Reveal>
            <h2 className="font-display text-[clamp(1.75rem,3.6vw,2.5rem)] font-medium leading-[1.12] tracking-[-0.015em] text-balance">
              Written by {author}
            </h2>
            <div className="mt-6 space-y-5 text-[1.0625rem] leading-[1.75] text-fg-soft">
              <p>
                {author} is the author and compiler of One Thread in the Fabric of Freedom.
                The book preserves the family history of his late wife, LaTanya D.
                Kelly-Douet, a descendant of Reverend Edmond Kelly.
              </p>
              <p>
                After LaTanya&apos;s passing in 2020, Peter continued the work she began,
                preserving Edmond Kelly&apos;s remarkable story for their children, their
                family, and future generations.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
