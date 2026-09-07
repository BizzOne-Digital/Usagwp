"use client";

import { useEffect } from "react";

/**
 * Arms the entrance reveals.
 *
 * The ordering here is deliberate. Nothing is hidden by the stylesheet on its
 * own: this component adds `data-reveal="on"` to the document, and only then
 * does the hidden-then-settle rule apply. So if the script never runs, or fails,
 * or the reader has reduced motion on, the page renders complete and visible.
 * An implementation that hides first and reveals later leaves the whole site
 * blank whenever the script does not arrive.
 */
export function RevealController() {
  useEffect(() => {
    const root = document.documentElement;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof IntersectionObserver === "undefined") return;

    const elements = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (elements.length === 0) return;

    root.dataset.reveal = "on";

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
    );

    for (const element of elements) observer.observe(element);

    // Safety net: if anything is still hidden shortly after load, show it. The
    // page being readable always wins over the animation playing.
    const failsafe = window.setTimeout(() => {
      for (const element of elements) element.classList.add("is-revealed");
    }, 4000);

    return () => {
      observer.disconnect();
      window.clearTimeout(failsafe);
      delete root.dataset.reveal;
    };
  }, []);

  return null;
}
