"use client";

import { useFormStatus } from "react-dom";
import { useId, type ReactNode } from "react";
import { CircleNotch } from "@phosphor-icons/react";

import { cn } from "@/lib/cn";

const controlBase =
  "w-full rounded-sm border border-line-strong bg-bg-surface px-3 py-2.5 text-sm text-fg " +
  "placeholder:text-fg-muted disabled:opacity-60";

type BaseProps = {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
};

function FieldShell({
  id,
  label,
  hint,
  error,
  required,
  className,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-sm font-medium text-fg">
        {label}
        {required ? <span className="ml-1 text-accent">*</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-accent-strong">
          {error}
        </p>
      ) : hint ? (
        <p className="text-sm text-fg-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextField({
  name,
  label,
  hint,
  error,
  required,
  className,
  type = "text",
  defaultValue,
  placeholder,
  autoComplete,
  maxLength,
}: BaseProps & {
  type?: string;
  defaultValue?: string | number;
  placeholder?: string;
  autoComplete?: string;
  maxLength?: number;
}) {
  const id = useId();
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={controlBase}
      />
    </FieldShell>
  );
}

export function TextAreaField({
  name,
  label,
  hint,
  error,
  required,
  className,
  defaultValue,
  rows = 5,
  maxLength,
}: BaseProps & { defaultValue?: string; rows?: number; maxLength?: number }) {
  const id = useId();
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      <textarea
        id={id}
        name={name}
        rows={rows}
        required={required}
        defaultValue={defaultValue}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(controlBase, "resize-y leading-relaxed")}
      />
    </FieldShell>
  );
}

export function SelectField({
  name,
  label,
  hint,
  error,
  required,
  className,
  defaultValue,
  value,
  onChange,
  options,
}: BaseProps & {
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  const id = useId();
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      <select
        id={id}
        name={name}
        {...(value === undefined ? { defaultValue } : { value })}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={controlBase}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function CheckboxField({
  name,
  label,
  hint,
  defaultChecked,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultChecked?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex items-start gap-2.5">
      <input
        id={id}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="mt-0.5 h-4 w-4 shrink-0 rounded-xs accent-[var(--brand)]"
      />
      <div>
        <label htmlFor={id} className="text-sm font-medium text-fg">
          {label}
        </label>
        {hint ? <p className="mt-0.5 text-sm text-fg-muted">{hint}</p> : null}
      </div>
    </div>
  );
}

export function SubmitButton({
  children = "Save changes",
  pendingLabel = "Saving",
}: {
  children?: ReactNode;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-brand px-6 text-sm font-medium text-brand-contrast transition-colors hover:bg-brand-strong active:translate-y-px disabled:opacity-60"
    >
      {pending ? (
        <>
          <CircleNotch size={16} className="animate-spin" aria-hidden />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function FormBanner({
  status,
  message,
}: {
  status: "idle" | "success" | "error";
  message: string;
}) {
  if (status === "idle" || !message) return null;
  return (
    <p
      role={status === "error" ? "alert" : "status"}
      className={cn(
        "rounded-sm border px-4 py-3 text-sm",
        status === "error"
          ? "border-accent/40 bg-accent/[0.06] text-accent-strong"
          : "border-brand/30 bg-brand/[0.06] text-brand",
      )}
    >
      {message}
    </p>
  );
}
