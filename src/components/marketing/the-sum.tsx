import { AmountCounter } from "@/components/marketing/amount-counter";
import { Reveal } from "@/components/marketing/reveal";

/**
 * The one inverted moment on the page. It is a deliberate colour block for the
 * emotional centre of the story, not a random theme flip: the page returns to
 * the paper ground immediately after.
 */
export function TheSum() {
  return (
    <section className="bg-indigo-900 py-24 text-fg-inverse md:py-32">
      <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
          <Reveal>
            <p className="font-display text-[clamp(4.5rem,13vw,10rem)] font-medium leading-[0.9] tracking-[-0.03em] text-fg-inverse">
              <AmountCounter value={2800} />
            </p>
            <p className="mt-5 max-w-[22ch] font-display text-[1.5rem] leading-snug text-accent-on-dark">
              The price of bringing his family home.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="space-y-5 text-[1.0625rem] leading-[1.75] text-fg-inverse-muted lg:border-l lg:border-line-inverse lg:pl-14">
              <p>
                His wife and his children were property, and property has a price. The sum set
                against them was two thousand eight hundred dollars.
              </p>
              <p>
                He had no money and no claim on any. What he had was a voice and the Gospel, so
                he took both across America, then across the Atlantic to England and to Ireland,
                and he preached until the amount was met.
              </p>
              <p className="text-fg-inverse">He raised all of it. They came home free.</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
