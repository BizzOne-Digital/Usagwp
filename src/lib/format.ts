import { createElement, type ReactNode } from "react";

export function formatPrice(value: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

export function formatLongDate(value: string | Date | null | undefined): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatShortDate(value: string | Date | null | undefined): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/**
 * Renders *asterisked* runs as italics.
 *
 * Deliberately the only markup supported, and deliberately not HTML: this
 * returns React nodes, so nothing an editor types can inject markup. Unmatched
 * or empty asterisks are left as literal text.
 */
export function withItalics(value: string | null | undefined): ReactNode[] {
  if (!value) return [];
  return value.split(/(\*[^*\n]+\*)/g).map((part, index) =>
    part.length > 2 && part.startsWith("*") && part.endsWith("*")
      ? createElement("em", { key: index }, part.slice(1, -1))
      : part,
  );
}

/** Splits a stored plain-text field into paragraphs for rendering. */
export function toParagraphs(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}
