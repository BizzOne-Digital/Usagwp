"use client";

import { useState } from "react";
import { Plus, Trash } from "@phosphor-icons/react";

type LinkRow = { label: string; url: string };

const control =
  "w-full rounded-sm border border-line-strong bg-bg-surface px-3 py-2.5 text-sm text-fg placeholder:text-fg-muted";

/**
 * Repeatable label/url rows. Each row submits as `<name>.label` and `<name>.url`,
 * which the server action reads back in pairs.
 */
export function LinkListField({
  name,
  label,
  defaultValue = [],
  labelPlaceholder = "Label",
  hint,
}: {
  name: string;
  label: string;
  defaultValue?: LinkRow[];
  labelPlaceholder?: string;
  hint?: string;
}) {
  const [rows, setRows] = useState<LinkRow[]>(
    defaultValue.length > 0 ? defaultValue : [{ label: "", url: "" }],
  );

  function update(index: number, patch: Partial<LinkRow>) {
    setRows((current) =>
      current.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)),
    );
  }

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-medium text-fg">{label}</legend>

      <div className="flex flex-col gap-2">
        {rows.map((row, index) => (
          <div key={index} className="flex flex-col gap-2 sm:flex-row">
            <input
              name={`${name}.label`}
              value={row.label}
              onChange={(event) => update(index, { label: event.target.value })}
              placeholder={labelPlaceholder}
              aria-label={`${label} name ${index + 1}`}
              className={`${control} sm:w-56`}
            />
            <input
              name={`${name}.url`}
              value={row.url}
              onChange={(event) => update(index, { url: event.target.value })}
              placeholder="https://"
              type="url"
              aria-label={`${label} address ${index + 1}`}
              className={`${control} sm:flex-1`}
            />
            <button
              type="button"
              onClick={() => setRows((current) => current.filter((_, i) => i !== index))}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-sm border border-line-strong px-3 text-sm text-fg-muted transition-colors hover:border-accent hover:text-accent"
            >
              <Trash size={15} aria-hidden />
              <span className="sr-only sm:not-sr-only">Remove</span>
            </button>
          </div>
        ))}
      </div>

      <div>
        <button
          type="button"
          onClick={() => setRows((current) => [...current, { label: "", url: "" }])}
          className="mt-1 inline-flex h-9 items-center gap-1.5 rounded-sm border border-line-strong px-3 text-[0.8125rem] font-medium text-fg transition-colors hover:border-fg"
        >
          <Plus size={14} aria-hidden />
          Add another
        </button>
      </div>

      {hint ? <p className="text-sm text-fg-muted">{hint}</p> : null}
      <p className="text-sm text-fg-muted">Rows with an empty name or address are ignored.</p>
    </fieldset>
  );
}
