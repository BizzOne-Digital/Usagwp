import { Reveal } from "@/components/marketing/reveal";

/**
 * Four ideas laid out as an offset weave rather than four equal cards. Each row
 * steps further right, so the section reads as something being woven line by
 * line, which is the image the book's title asks for.
 */
const THREADS = [
  {
    word: "Faith",
    line: "He learned to read so that he could preach, and preaching became the only tool he had.",
  },
  {
    word: "Courage",
    line: "He crossed an ocean and back for a sum he had no guarantee of raising.",
  },
  {
    word: "Family",
    line: "Every mile of that journey was for four people whose freedom had a price on it.",
  },
  {
    word: "Freedom",
    line: "He spent the rest of his life building churches and ministering to those who ran.",
  },
] as const;

export function FourThreads() {
  return (
    <section className="border-b border-line bg-bg py-20 md:py-28">
      <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
        <div className="space-y-2 md:space-y-0">
          {THREADS.map((thread, index) => (
            <Reveal key={thread.word} delay={index * 0.07}>
              <div
                // The stagger is a desktop composition only. Below md every row
                // returns to a flush single column.
                className="grid items-baseline gap-x-8 gap-y-2 border-t border-line py-7 md:ml-[var(--offset)] md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]"
                style={{ "--offset": `${index * 4}vw` } as React.CSSProperties}
              >
                <h2 className="font-display text-[clamp(2.25rem,6vw,4.5rem)] font-medium leading-[0.95] tracking-[-0.025em] text-fg">
                  {thread.word}
                </h2>
                <p className="max-w-[44ch] text-[1.0625rem] leading-relaxed text-fg-muted">
                  {thread.line}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
