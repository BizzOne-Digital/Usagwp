import { SubscribeForm } from "@/components/forms/subscribe-form";
import { Reveal } from "@/components/marketing/reveal";
import type { PublicationStatus } from "@/lib/content";

/**
 * The copy here has to follow the publication status. Before the book exists,
 * this is the pre-launch list. Once the admin switches the book to Published,
 * telling readers it is still at the printer would be untrue, so the section
 * becomes an ordinary keep-in-touch invitation instead.
 */
export function StayUpdated({ status = "coming-soon" }: { status?: PublicationStatus }) {
  const comingSoon = status === "coming-soon";

  return (
    <section id="stay-updated" className="scroll-mt-20 bg-bg py-20 md:py-28">
      <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
        <div className="grid gap-10 border-t border-line pt-12 md:grid-cols-[1fr_1fr] md:gap-16">
          <Reveal>
            <h2 className="max-w-[16ch] font-display text-[clamp(2rem,4.4vw,3.25rem)] font-medium leading-[1.08] tracking-[-0.015em] text-balance">
              {comingSoon ? "Be among the first to read his story" : "Keep in touch"}
            </h2>
            <p className="mt-5 max-w-[42ch] text-[1.0625rem] leading-relaxed text-fg-muted">
              {comingSoon
                ? "The book is in its final stage before printing. Leave your email and we will write to you once, when it is available."
                : "Leave your email for news about readings, talks and the research behind the book. We write rarely."}
            </p>
          </Reveal>

          <Reveal delay={0.08} className="md:pt-2">
            <SubscribeForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
