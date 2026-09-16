"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { List, X } from "@phosphor-icons/react";

import { BrandMark } from "@/components/ui/brand-mark";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/book", label: "The Book" },
  { href: "/about", label: "About" },
  { href: "/family-tree", label: "Family Tree" },
  { href: "/author-notes", label: "Author Notes" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close the drawer on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape to close, and lock background scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-bg/92 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-6 px-5 md:h-[72px] lg:px-10">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-sm"
            aria-label="Edmond Kelly home"
          >
            <BrandMark className="h-7 w-7 text-brand" />
            <span className="font-display text-lg font-semibold tracking-[0.16em] text-fg">
              Edmond Kelly
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-7">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "relative py-1 text-sm transition-colors",
                      isActive(item.href)
                        ? "text-fg"
                        : "text-fg-muted hover:text-fg",
                    )}
                  >
                    {item.label}
                    {isActive(item.href) ? (
                      <span
                        aria-hidden
                        className="absolute -bottom-0.5 left-0 h-px w-full bg-accent"
                      />
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/#stay-updated"
              className="hidden h-10 items-center rounded-sm bg-brand px-4 text-sm font-medium text-brand-contrast transition-colors hover:bg-brand-strong active:translate-y-px sm:inline-flex"
            >
              Stay Updated
            </Link>

            <button
              ref={triggerRef}
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls={panelId}
              className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-line-strong text-fg lg:hidden"
            >
              <List size={20} weight="regular" aria-hidden />
              <span className="sr-only">Open menu</span>
            </button>
          </div>
        </div>
      </header>

      {/*
        The drawer is rendered OUTSIDE <header> on purpose. The header carries
        backdrop-blur, and a backdrop-filter establishes a containing block for
        fixed-position descendants: nested here, `inset-0` would resolve to the
        64px header box rather than the viewport, and the nav links would be
        clipped out of sight.
      */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-indigo-900/45"
          />
          <div
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="absolute inset-y-0 right-0 flex w-[min(21rem,88vw)] flex-col bg-bg shadow-2xl"
          >
            <div className="flex h-16 items-center justify-between border-b border-line px-5">
              <span className="font-display text-lg font-semibold tracking-[0.16em]">
                Edmond Kelly
              </span>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-line-strong"
              >
                <X size={18} aria-hidden />
                <span className="sr-only">Close menu</span>
              </button>
            </div>

            <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-5 py-6">
              <ul className="flex flex-col">
                {NAV_ITEMS.map((item) => (
                  <li key={item.href} className="border-b border-line last:border-b-0">
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className={cn(
                        "block py-4 font-display text-2xl",
                        isActive(item.href) ? "text-accent" : "text-fg",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="border-t border-line p-5">
              <Link
                href="/#stay-updated"
                className="flex h-12 w-full items-center justify-center rounded-sm bg-brand text-sm font-medium text-brand-contrast"
              >
                Stay Updated
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
