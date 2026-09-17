"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowSquareOut,
  BookOpen,
  ChatCircleText,
  Envelope,
  FileText,
  Gear,
  Images,
  List,
  Question,
  SignOut,
  SquaresFour,
  Users,
  Wrench,
  X,
} from "@phosphor-icons/react";

import { BrandMark } from "@/components/ui/brand-mark";
import { cn } from "@/lib/cn";

const SECTIONS = [
  {
    title: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: SquaresFour }],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/book", label: "The Book", icon: BookOpen },
      { href: "/admin/pages", label: "Pages and SEO", icon: FileText },
      { href: "/admin/author-notes", label: "Author Notes", icon: Wrench },
      { href: "/admin/lineage", label: "Lineage", icon: Users },
      { href: "/admin/ebook-order", label: "eBook/Paperback Order", icon: FileText },
      { href: "/admin/faqs", label: "Questions", icon: Question },
      { href: "/admin/testimonials", label: "Testimonials", icon: ChatCircleText },
    ],
  },
  {
    title: "Audience",
    items: [
      { href: "/admin/messages", label: "Messages", icon: Envelope },
      { href: "/admin/subscribers", label: "Subscribers", icon: Users },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/admin/media", label: "Media library", icon: Images },
      { href: "/admin/settings", label: "Site settings", icon: Gear },
    ],
  },
] as const;

export function AdminShell({
  children,
  userName,
  userEmail,
}: {
  children: ReactNode;
  userName: string;
  userEmail: string;
}) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const nav = (
    <nav aria-label="Admin sections" className="flex flex-col gap-7 p-4">
      {SECTIONS.map((section) => (
        <div key={section.title}>
          <h2 className="px-2 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-fg-muted">
            {section.title}
          </h2>
          <ul className="mt-2 flex flex-col gap-0.5">
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-sm px-2 py-2 text-sm transition-colors",
                      active
                        ? "bg-brand/[0.10] font-medium text-brand"
                        : "text-fg-soft hover:bg-fg/[0.05] hover:text-fg",
                    )}
                  >
                    <Icon size={17} weight={active ? "fill" : "regular"} aria-hidden />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-[100dvh] bg-bg-deep">
      <aside className="sticky top-0 hidden h-[100dvh] w-64 shrink-0 flex-col overflow-y-auto border-r border-line bg-bg lg:flex">
        <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-line px-4">
          <BrandMark className="h-6 w-6 text-brand" />
          <span className="font-display text-base font-semibold tracking-[0.14em]">
            Edmond Kelly
          </span>
        </div>
        {nav}
        <div className="mt-auto border-t border-line p-4">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 text-sm text-fg-muted transition-colors hover:text-fg"
          >
            <ArrowSquareOut size={15} aria-hidden />
            View the site
          </Link>
        </div>
      </aside>

      {navOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setNavOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-indigo-900/45"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Admin navigation"
            className="absolute inset-y-0 left-0 flex w-[min(17rem,85vw)] flex-col overflow-y-auto bg-bg"
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-4">
              <span className="font-display text-base font-semibold tracking-[0.14em]">
                Edmond Kelly
              </span>
              <button
                type="button"
                onClick={() => setNavOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-line-strong"
              >
                <X size={16} aria-hidden />
                <span className="sr-only">Close</span>
              </button>
            </div>
            {nav}
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-line bg-bg px-4 lg:px-8">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            aria-expanded={navOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-line-strong lg:hidden"
          >
            <List size={18} aria-hidden />
            <span className="sr-only">Open navigation</span>
          </button>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-tight text-fg">{userName || "Admin"}</p>
              <p className="text-xs leading-tight text-fg-muted">{userEmail}</p>
            </div>
            <form action="/api/admin/logout" method="post">
              <button
                type="submit"
                className="inline-flex h-10 items-center gap-1.5 rounded-sm border border-line-strong px-3 text-sm font-medium text-fg transition-colors hover:border-fg"
              >
                <SignOut size={15} aria-hidden />
                Sign out
              </button>
            </form>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-7 lg:px-8 lg:py-9">{children}</main>
      </div>
    </div>
  );
}
