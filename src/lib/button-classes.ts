import { cn } from "@/lib/cn";

/**
 * One definition of what a button looks like, shared by links, submit buttons
 * and form controls across the public site and the CMS.
 *
 * This is a class builder rather than a component because the call sites are a
 * mix of `next/link`, plain `<a>`, `<button>` and server-action forms, and
 * wrapping all of them would add an abstraction without removing any real
 * duplication. What needed to be in one place was the styling.
 *
 * Filled variants take their text colour from `--brand-contrast` /
 * `--accent-contrast`, which flip per theme, so a filled button can never end up
 * light-on-light. See globals.css.
 */

export type ButtonVariant = "primary" | "secondary" | "ghost" | "inverse" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm font-medium " +
  "transition-colors active:translate-y-px disabled:pointer-events-none disabled:opacity-60";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand text-brand-contrast hover:bg-brand-strong",
  secondary:
    "border border-line-strong bg-transparent text-fg hover:border-fg hover:bg-fg/[0.04]",
  ghost: "text-fg hover:bg-fg/[0.06]",
  // For use only on the inverse ink section, where the ground is already dark.
  inverse: "bg-fg-inverse text-indigo-900 hover:bg-white",
  danger: "bg-accent text-accent-contrast hover:bg-accent-strong",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-[0.8125rem]",
  md: "h-11 px-6 text-sm",
  lg: "h-12 px-7 text-[0.9375rem]",
};

export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
): string {
  return cn(base, variants[variant], sizes[size], className);
}
