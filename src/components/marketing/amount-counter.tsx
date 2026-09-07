"use client";

import { useEffect, useRef } from "react";

/**
 * Counts the sum up once, the first time it scrolls into view.
 *
 * The final figure is what renders on the server, so the number is correct
 * before any script runs and stays correct if none ever does. The count is only
 * armed on the client, and only for an element that is not already on screen:
 * animating something the reader is already looking at is a flash, not a
 * reveal. The value is written straight to the DOM node from a rAF loop, so no
 * React state is touched per frame.
 *
 * Justification for the motion: the number is the emotional centre of the
 * story, and counting it out makes the reader feel the length of the effort it
 * took to raise it.
 */
export function AmountCounter({ value, prefix = "$" }: { value: number; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const finalText = `${prefix}${value.toLocaleString("en-US")}`;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    // Already on screen at load: leave the final figure in place.
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) return;

    node.textContent = `${prefix}0`;

    let frame = 0;
    let start = 0;
    const duration = 1800;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // Matches the site's editorial easing curve.
      const eased = 1 - Math.pow(1 - progress, 3);
      node.textContent = `${prefix}${Math.round(value * eased).toLocaleString("en-US")}`;
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        frame = requestAnimationFrame(step);
      },
      { rootMargin: "0px 0px -20% 0px" },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      node.textContent = finalText;
    };
  }, [value, prefix]);

  return <span ref={ref} className="tabular-nums">{`${prefix}${value.toLocaleString("en-US")}`}</span>;
}
