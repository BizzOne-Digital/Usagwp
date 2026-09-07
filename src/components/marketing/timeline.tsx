import { Reveal } from "@/components/marketing/reveal";

/**
 * Every entry below comes from the client-supplied summary. Nothing is inferred,
 * dated, or embellished beyond what the source states.
 */
const MOMENTS = [
  {
    marker: "1817",
    title: "Born into slavery",
    body: "Edmond Kelly is born in Columbia, Tennessee, the property of another man.",
  },
  {
    marker: "In secret",
    title: "He teaches himself to read",
    body: "Literacy was forbidden to him, so he learned it quietly and alone.",
  },
  {
    marker: "Ordained",
    title: "The first in Tennessee",
    body: "He becomes the first Black man ordained as a Baptist minister in the state.",
  },
  {
    marker: "Escape",
    title: "He flees bondage",
    body: "He leaves behind a wife and children who remain enslaved, and begins the work of buying them back.",
  },
  {
    marker: "The journey",
    title: "America, England, Ireland",
    body: "He preaches across three countries, raising the sum his family is priced at.",
  },
  {
    marker: "$2,800",
    title: "His family is freed",
    body: "He raises the full amount and purchases the freedom of his wife and children.",
  },
  {
    marker: "The war",
    title: "Ministry to the escaped",
    body: "He meets Abraham Lincoln, and ministers to people escaping slavery during the Civil War.",
  },
  {
    marker: "Legacy",
    title: "Churches, and a family line",
    body: "He founds numerous churches and gives his life to the Gospel and to freedom.",
  },
] as const;

export function Timeline() {
  return (
    <section className="border-b border-line bg-bg-deep py-20 md:py-28">
      <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
        <div className="md:ml-[8vw]">
          <Reveal>
            <h2 className="max-w-[18ch] font-display text-[clamp(2rem,4.4vw,3.25rem)] font-medium leading-[1.08] tracking-[-0.015em] text-balance">
              The shape of one life
            </h2>
          </Reveal>

          <ol className="relative mt-14 max-w-[52rem]">
          {/* The thread runs the length of the life. */}
          <span
            aria-hidden
            className="thread-rule absolute bottom-3 left-[7px] top-3 w-px opacity-60 md:left-[calc(9rem+7px)]"
          />
            {MOMENTS.map((moment, index) => (
              <Reveal as="li" key={moment.title} delay={Math.min(index, 4) * 0.05}>
              <div className="relative grid gap-1.5 pb-11 pl-8 md:grid-cols-[9rem_1fr] md:gap-x-8 md:pl-0 last:pb-0">
                <span
                  aria-hidden
                  className="absolute left-[3px] top-[0.55rem] h-2.5 w-2.5 rounded-full border border-accent bg-bg-deep md:left-[calc(9rem+3px)]"
                />
                <p className="font-sans text-sm font-medium tracking-[0.02em] text-accent md:pt-0.5 md:text-right">
                  {moment.marker}
                </p>
                <div className="md:pl-8">
                  <h3 className="font-display text-[1.5rem] leading-tight text-fg">
                    {moment.title}
                  </h3>
                  <p className="mt-1.5 max-w-[46ch] text-[0.9375rem] leading-relaxed text-fg-muted">
                    {moment.body}
                  </p>
                </div>
              </div>
            </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
