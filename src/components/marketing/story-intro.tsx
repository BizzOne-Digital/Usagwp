import { Reveal } from "@/components/marketing/reveal";

/**
 * An indented editorial column, set in from the left the way a book's opening
 * page is. It is deliberately not centred: the whole site reads off a left
 * axis, and a centred column here would break that rhythm.
 */
export function StoryIntro() {
  return (
    <section className="border-b border-line bg-bg py-20 md:py-28">
      <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
        <div className="max-w-[44rem] md:ml-[8vw]">
          <Reveal>
            <h2 className="font-display text-[clamp(2rem,4.4vw,3.25rem)] font-medium leading-[1.08] tracking-[-0.015em] text-balance">
              A life written against the odds
            </h2>
          </Reveal>

          <Reveal delay={0.08}>
            <p className="mt-8 font-display text-[1.5rem] leading-[1.45] text-fg italic">
              He was born the property of another man, and he died a minister who had
              bought back everyone he loved.
            </p>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="mt-8 space-y-5 text-[1.0625rem] leading-[1.75] text-fg-soft">
              <p>
                Edmond Kelly was born into slavery in Columbia, Tennessee, in 1817. Teaching
                an enslaved person to read was forbidden, so he taught himself, quietly, over
                years. What he learned to read, he learned to preach.
              </p>
              <p>
                He became the first Black man ordained as a Baptist minister in Tennessee.
                When he fled bondage, he left behind a wife and children who were still owned.
                Buying them back became the work of his life.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
