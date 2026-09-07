"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { CircleNotch } from "@phosphor-icons/react";

const field =
  "w-full rounded-sm border border-line-strong bg-bg-surface px-3 py-2.5 text-sm text-fg placeholder:text-fg-muted";

export function LoginForm() {
  const router = useRouter();
  const emailId = useId();
  const passwordId = useId();

  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(data.get("email") ?? ""),
          password: String(data.get("password") ?? ""),
        }),
      });

      const payload: { success?: boolean; error?: string } = await response
        .json()
        .catch(() => ({}));

      if (!response.ok || !payload.success) {
        setPending(false);
        setError(payload.error ?? "Sign in failed. Please try again.");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setPending(false);
      setError("We could not reach the server. Please check your connection.");
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {error ? (
        <p
          role="alert"
          className="rounded-sm border border-accent/40 bg-accent/[0.06] px-3 py-2.5 text-sm text-accent-strong"
        >
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        <label htmlFor={emailId} className="text-sm font-medium text-fg">
          Email address
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          required
          autoComplete="username"
          className={field}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={passwordId} className="text-sm font-medium text-fg">
          Password
        </label>
        <input
          id={passwordId}
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={field}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-1 inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-brand px-6 text-sm font-medium text-brand-contrast transition-colors hover:bg-brand-strong active:translate-y-px disabled:opacity-60"
      >
        {pending ? (
          <>
            <CircleNotch size={16} className="animate-spin" aria-hidden />
            Signing in
          </>
        ) : (
          "Sign in"
        )}
      </button>
    </form>
  );
}
