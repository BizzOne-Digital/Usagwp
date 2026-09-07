"use client";

import { useId, useState } from "react";
import { CircleNotch } from "@phosphor-icons/react";

type Status = "idle" | "submitting" | "success" | "error";
type FieldErrors = Partial<Record<"name" | "email" | "phone" | "subject" | "message", string>>;

const field =
  "w-full rounded-sm border border-line-strong bg-bg-surface px-3.5 py-3 text-[0.9375rem] text-fg placeholder:text-fg-muted";

export function ContactForm() {
  const ids = {
    name: useId(),
    email: useId(),
    phone: useId(),
    subject: useId(),
    message: useId(),
    summary: useId(),
  };

  const [status, setStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setStatus("submitting");
    setFormError("");
    setErrors({});

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          phone: String(data.get("phone") ?? ""),
          subject: String(data.get("subject") ?? ""),
          message: String(data.get("message") ?? ""),
          website: String(data.get("website") ?? ""),
        }),
      });

      const payload: {
        success?: boolean;
        error?: string;
        fieldErrors?: FieldErrors;
      } = await response.json().catch(() => ({}));

      if (!response.ok || !payload.success) {
        setStatus("error");
        setErrors(payload.fieldErrors ?? {});
        setFormError(
          payload.error ?? "Your message could not be sent just now. Please try again.",
        );
        return;
      }

      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setFormError("We could not reach the server. Please check your connection.");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="rounded-sm border border-line-strong bg-bg-surface p-7"
      >
        <h2 className="font-display text-2xl text-fg">Your message has been received</h2>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-fg-muted">
          Thank you for writing. We read every message and will reply to you directly.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 inline-flex h-11 items-center rounded-sm border border-line-strong px-5 text-sm font-medium text-fg transition-colors hover:border-fg"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div aria-hidden className="absolute h-0 w-0 overflow-hidden">
        <label htmlFor={`${ids.name}-website`}>Leave this empty</label>
        <input id={`${ids.name}-website`} name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {formError ? (
        <p
          id={ids.summary}
          role="alert"
          className="rounded-sm border border-accent/40 bg-accent/[0.06] px-4 py-3 text-sm text-accent-strong"
        >
          {formError}
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id={ids.name}
          name="name"
          label="Your name"
          autoComplete="name"
          required
          error={errors.name}
        />
        <Field
          id={ids.email}
          name="email"
          type="email"
          label="Email address"
          autoComplete="email"
          required
          error={errors.email}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id={ids.phone}
          name="phone"
          type="tel"
          label="Phone"
          optional
          autoComplete="tel"
          error={errors.phone}
        />
        <Field id={ids.subject} name="subject" label="Subject" optional error={errors.subject} />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={ids.message} className="text-sm font-medium text-fg">
          Message
        </label>
        <textarea
          id={ids.message}
          name="message"
          required
          rows={6}
          maxLength={4000}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? `${ids.message}-error` : undefined}
          className={field}
        />
        {errors.message ? (
          <p id={`${ids.message}-error`} className="text-sm text-accent-strong">
            {errors.message}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-sm bg-brand px-7 text-[0.9375rem] font-medium text-brand-contrast transition-colors hover:bg-brand-strong active:translate-y-px disabled:opacity-60"
      >
        {status === "submitting" ? (
          <>
            <CircleNotch size={16} className="animate-spin" aria-hidden />
            Sending
          </>
        ) : (
          "Send message"
        )}
      </button>
    </form>
  );
}

function Field({
  id,
  name,
  label,
  type = "text",
  required = false,
  optional = false,
  autoComplete,
  error,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  optional?: boolean;
  autoComplete?: string;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-fg">
        {label}
        {optional ? <span className="font-normal text-fg-muted"> (optional)</span> : null}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={field}
      />
      {error ? (
        <p id={`${id}-error`} className="text-sm text-accent-strong">
          {error}
        </p>
      ) : null}
    </div>
  );
}
