import Link from "next/link";
import type { ReactNode } from "react";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";

export function PageHeading({
  title,
  description,
  breadcrumbs = [],
  actions,
}: {
  title: string;
  description?: string;
  breadcrumbs?: { href: string; label: string }[];
  actions?: ReactNode;
}) {
  return (
    <div className="mb-7">
      {breadcrumbs.length > 0 ? (
        <nav aria-label="Breadcrumb" className="mb-3">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-fg-muted">
            {breadcrumbs.map((crumb) => (
              <li key={crumb.href} className="flex items-center gap-1.5">
                <Link href={crumb.href} className="transition-colors hover:text-fg">
                  {crumb.label}
                </Link>
                <CaretRight size={12} aria-hidden />
              </li>
            ))}
            <li aria-current="page" className="text-fg">
              {title}
            </li>
          </ol>
        </nav>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-[-0.01em] text-fg">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-fg-muted">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}

export function Panel({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-sm border border-line bg-bg p-5 lg:p-6">
      {title ? (
        <header className="mb-5">
          <h2 className="font-display text-xl text-fg">{title}</h2>
          {description ? (
            <p className="mt-1.5 max-w-[62ch] text-sm text-fg-muted">{description}</p>
          ) : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

export function AdminEmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-sm border border-dashed border-line-strong px-6 py-14 text-center">
      <h3 className="font-display text-xl text-fg">{title}</h3>
      <p className="mx-auto mt-2 max-w-[46ch] text-sm leading-relaxed text-fg-muted">{body}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
