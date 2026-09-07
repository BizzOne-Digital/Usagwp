"use client";

import { useEffect } from "react";
import Link from "next/link";
import { buttonClasses } from "@/lib/button-classes";

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Stack traces stay server-side. The reader sees plain language only.
    console.error("[usagwp] page error", error);
  }, [error]);

  return (
    <section className="bg-bg py-28 md:py-36">
      <div className="mx-auto max-w-[46rem] px-5 lg:px-10">
        <span aria-hidden className="block h-12 w-px bg-accent" />
        <h1 className="mt-8 font-display text-[clamp(2.2rem,5vw,3.5rem)] font-medium leading-tight">
          Something went wrong on our side
        </h1>
        <p className="mt-5 max-w-[48ch] text-[1.0625rem] leading-relaxed text-fg-soft">
          This is not something you did. Try again, and if it keeps happening, please write to
          us and tell us what you were looking at.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className={buttonClasses("primary", "lg", "px-6")}
          >
            Try again
          </button>
          <Link
            href="/contact"
            className={buttonClasses("secondary", "lg", "px-6")}
          >
            Contact us
          </Link>
        </div>
      </div>
    </section>
  );
}
