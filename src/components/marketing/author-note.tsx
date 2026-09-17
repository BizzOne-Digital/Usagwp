import { Reveal } from "@/components/marketing/reveal";

/**
 * Positions Peter Douet as the descendant preserving the record. Deliberately
 * short: no biography is invented here. Once the client adds a photo and bio in
 * the CMS team section, that page carries the fuller account.
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
                {author} is the author of One Thread in the Fabric of Freedom. Edmond Kelly is
                his ancestor, and this book is the record of that line: a family history kept,
                traced and set down so that it is not lost.
              </p>
              <p>
                It is a work of biography and history, drawn from the life of a man who was
                born owned and who died free, having freed the people he loved.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
