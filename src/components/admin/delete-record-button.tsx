"use client";

import { useEffect, useRef, useState } from "react";
import { Trash } from "@phosphor-icons/react";
import { buttonClasses } from "@/lib/button-classes";

/**
 * Deletion is irreversible, so it always goes through an explicit confirmation
 * dialog rather than a bare button.
 */
export function DeleteRecordButton({
  collection,
  recordId,
  label,
  action,
}: {
  collection: string;
  recordId: string;
  label: string;
  action: (form: FormData) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={buttonClasses("secondary", "md", "px-4 hover:border-accent hover:text-accent")}
      >
        <Trash size={15} aria-hidden />
        Delete
      </button>

      {open ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-5">
          <button
            type="button"
            aria-label="Cancel"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-indigo-900/50"
          />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={`${recordId}-delete-title`}
            className="relative w-full max-w-md rounded-sm border border-line bg-bg p-6 shadow-2xl"
          >
            <h2
              id={`${recordId}-delete-title`}
              className="font-display text-xl text-fg"
            >
              Delete this {label.toLowerCase()}?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">
              This removes the record and any image uploaded with it. It cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                ref={cancelRef}
                type="button"
                onClick={() => setOpen(false)}
                className={buttonClasses("secondary", "md", "px-4")}
              >
                Keep it
              </button>
              <form action={action}>
                <input type="hidden" name="__collection" value={collection} />
                <input type="hidden" name="__id" value={recordId} />
                <button
                  type="submit"
                  className={buttonClasses("danger", "md", "px-4")}
                >
                  Delete permanently
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
