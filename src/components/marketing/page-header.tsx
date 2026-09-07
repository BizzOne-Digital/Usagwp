import type { ReactNode } from "react";

export function PageHeader({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children?: ReactNode;
}) {
  return (
    <header className="border-b border-line bg-bg">
      <div className="mx-auto max-w-[1400px] px-5 pb-14 pt-14 md:pb-20 md:pt-20 lg:px-10">
        <h1 className="max-w-[18ch] font-display text-[clamp(2.4rem,6vw,4.25rem)] font-medium leading-[1.03] tracking-[-0.02em] text-balance">
          {title}
        </h1>
        {intro ? (
          <p className="mt-6 max-w-[52ch] text-[1.0625rem] leading-relaxed text-fg-soft text-pretty">
            {intro}
          </p>
        ) : null}
        {children}
      </div>
    </header>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="border-t border-line py-16 text-center">
      <span aria-hidden className="mx-auto block h-10 w-px bg-accent opacity-60" />
      <h2 className="mt-6 font-display text-2xl text-fg">{title}</h2>
      <p className="mx-auto mt-3 max-w-[46ch] text-[0.9375rem] leading-relaxed text-fg-muted">
        {body}
      </p>
      {action ? <div className="mt-7">{action}</div> : null}
    </div>
  );
}
