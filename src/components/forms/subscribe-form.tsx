"use client";

import { useId, useState } from "react";
import { CircleNotch } from "@phosphor-icons/react";

type Status = "idle" | "submitting" | "success" | "error";

export function SubscribeForm({ tone = "light" }: { tone?: "light" | "inverse" }) {
  const emailId = useId();
  const nameId = useId();
  const errorId = useId();

  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const inverse = tone === "inverse";

  const fieldClasses = inverse
    ? "h-12 w-full rounded-sm border border-line-inverse bg-transparent px-3.5 text-[0.9375rem] text-fg-inverse placeholder:text-fg-inverse-muted"
    : "h-12 w-full rounded-sm border border-line-strong bg-bg-surface px-3.5 text-[0.9375rem] text-fg placeholder:text-fg-muted";

  const labelClasses = inverse
    ? "text-sm font-medium text-fg-inverse"
    : "text-sm font-medium text-fg";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setStatus("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(data.get("email") ?? ""),
          firstName: String(data.get("firstName") ?? ""),
          website: String(data.get("website") ?? ""),
        }),
      });

      const payload: { success?: boolean; message?: string; error?: string } =
        await response.json().catch(() => ({}));

      if (!response.ok || !payload.success) {
        setStatus("error");
        setMessage(payload.error ?? "We could not save that just now. Please try again.");
        return;
      }

      setStatus("success");
      setMessage(payload.message ?? "You are on the list.");
      form.reset();
    } catch {
      setStatus("error");
      setMessage("We could not reach the server. Please check your connection.");
    }
  }

  if (status === "success") {
    return (
      <p
        role="status"
        className={
          inverse
            ? "rounded-sm border border-line-inverse px-4 py-5 text-[0.9375rem] text-fg-inverse"
            : "rounded-sm border border-line-strong bg-bg-surface px-4 py-5 text-[0.9375rem] text-fg"
        }
      >
        {message} We will write to you when the book is available.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="w-full">
      {/* Honeypot: hidden from people, tempting to bots. */}
      <div aria-hidden className="absolute h-0 w-0 overflow-hidden">
        <label htmlFor={`${emailId}-website`}>Leave this empty</label>
        <input
          id={`${emailId}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor={nameId} className={labelClasses}>
            First name <span className="font-normal opacity-70">(optional)</span>
          </label>
          <input
            id={nameId}
            name="firstName"
            type="text"
            autoComplete="given-name"
            maxLength={80}
            className={fieldClasses}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor={emailId} className={labelClasses}>
            Email address
          </label>
          <input
            id={emailId}
            name="email"
            type="email"
            required
            autoComplete="email"
            maxLength={200}
            aria-describedby={status === "error" ? errorId : undefined}
            aria-invalid={status === "error" || undefined}
            className={fieldClasses}
          />
        </div>
      </div>

      {status === "error" ? (
        <p
          id={errorId}
          role="alert"
          className={
            inverse
              ? "mt-3 text-sm text-accent-on-dark"
              : "mt-3 text-sm text-accent-strong"
          }
        >
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "submitting"}
        className={
          inverse
            ? "mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-sm bg-fg-inverse px-7 text-[0.9375rem] font-medium text-indigo-900 transition-colors hover:bg-white active:translate-y-px disabled:opacity-60"
            : "mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-sm bg-brand px-7 text-[0.9375rem] font-medium text-brand-contrast transition-colors hover:bg-brand-strong active:translate-y-px disabled:opacity-60"
        }
      >
        {status === "submitting" ? (
          <>
            <CircleNotch size={16} className="animate-spin" aria-hidden />
            Adding you
          </>
        ) : (
          "Stay Updated"
        )}
      </button>
    </form>
  );
}
