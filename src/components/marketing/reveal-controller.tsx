"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Arms the entrance reveals.
 *
 * The logic is deliberately inverted from the obvious implementation. Content
 * is visible by default and the ONLY thing that ever hides an element is the
 * IntersectionObserver reporting that the element is off screen. An element the
 * reader can see is therefore never hidden, whatever the timing.
 *
 * The obvious approach (hide everything, then reveal what is in view) fails in
 * two ways that both blank real content:
 *
 *   - The first observer callback is asynchronous, so the browser paints the
 *     blanked page before anything is handed back.
 *   - Measuring "what is on screen" during a client-side navigation races the
 *     router. This component lives in the shared layout, which is not
 *     remounted between pages, and the new page's layout has not settled when
 *     the effect fires, so pages stay blank until a full reload.
 *
 * Hiding only what the observer has confirmed is off screen removes both
 * problems. The worst case becomes an element missing its animation and simply
 * appearing, which is the correct way for this to fail.
 */
export function RevealController() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof IntersectionObserver === "undefined") return;

    const elements = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const element = entry.target as HTMLElement;

          if (entry.isIntersecting) {
            // Visible: drop the hidden state and stop watching. If it was
            // hidden the transition plays; if it was never hidden nothing
            // visibly happens, which is right for content already on screen.
            element.classList.remove("is-pending");
            observer.unobserve(element);
            continue;
          }

          // Off screen: safe to hide, because the reader cannot see it.
          element.classList.add("is-pending");
        }
      },
      // Only a small inset. A larger negative margin leaves an element that is
      // already peeking above the fold sitting blank until the reader scrolls.
      { rootMargin: "0px 0px -24px 0px", threshold: 0 },
    );

    for (const element of elements) observer.observe(element);

    /**
     * Safety net for the one failure that matters: something the reader can see
     * is still hidden. It rescues only elements currently on screen and leaves
     * the observer running, so content further down the page keeps its
     * animation instead of every reveal being switched off after a few seconds.
     */
    const failsafe = window.setInterval(() => {
      const viewportHeight = window.innerHeight;
      let rescued = false;

      for (const element of elements) {
        if (!element.classList.contains("is-pending")) continue;
        const rect = element.getBoundingClientRect();
        const visible = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
        if (visible > 16) {
          element.classList.remove("is-pending");
          observer.unobserve(element);
          rescued = true;
        }
      }

      if (rescued) {
        console.warn("[usagwp] reveal failsafe showed content the observer had missed");
      }
    }, 1200);

    return () => {
      observer.disconnect();
      window.clearInterval(failsafe);
      for (const element of elements) element.classList.remove("is-pending");
    };
  }, [pathname]);

  return null;
}
