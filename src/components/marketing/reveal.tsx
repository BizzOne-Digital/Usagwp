import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * The single entrance primitive used across the site.
 *
 * This is a Server Component that renders its children plainly. The hidden
 * state is applied only after RevealController arms it on the client, which
 * matters here: an implementation that starts at opacity 0 and waits for a
 * script leaves the entire page invisible whenever the script fails, and ships
 * hidden text to any crawler that does not run JS.
 *
 * Justification for the motion: the homepage is read as a narrative top to
 * bottom, and a short settle gives each beat of the story its own moment.
 */
export function Reveal({
  children,
  delay = 0,
  as: Component = "div",
  className,
}: {
  children: ReactNode;
  /** Seconds to stagger this element behind its neighbours. */
  delay?: number;
  as?: "div" | "section" | "li";
  className?: string;
}) {
  return (
    <Component
      className={cn("reveal", className)}
      style={delay ? ({ "--reveal-delay": `${delay}s` } as CSSProperties) : undefined}
    >
      {children}
    </Component>
  );
}
