"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Copy, Trash } from "@phosphor-icons/react";

import { useToast } from "@/components/admin/toast";
import { cn } from "@/lib/cn";
import { formatShortDate } from "@/lib/format";
import { buttonClasses } from "@/lib/button-classes";

type MediaFile = {
  id: string;
  url: string;
  folder: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string | null;
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaLibrary({
  files,
  folders,
  activeFolder,
  search,
  deleteAction,
}: {
  files: MediaFile[];
  folders: string[];
  activeFolder: string;
  search: string;
  deleteAction: (form: FormData) => Promise<void>;
}) {
  const toast = useToast();
  const [pendingDelete, setPendingDelete] = useState<MediaFile | null>(null);

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(new URL(url, window.location.origin).toString());
      toast.push({ tone: "success", message: "Address copied." });
    } catch {
      toast.push({ tone: "error", message: "The address could not be copied." });
    }
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-end gap-4">
        <nav aria-label="Filter by folder" className="flex flex-wrap gap-1.5">
          <FolderTab href="/admin/media" label="All" active={!activeFolder} />
          {folders.map((folder) => (
            <FolderTab
              key={folder}
              href={`/admin/media?folder=${folder}`}
              label={folder}
              active={activeFolder === folder}
            />
          ))}
        </nav>

        <form action="/admin/media" className="ml-auto flex items-end gap-2">
          {activeFolder ? (
            <input type="hidden" name="folder" value={activeFolder} />
          ) : null}
          <div className="flex flex-col gap-2">
            <label htmlFor="media-search" className="text-sm font-medium text-fg">
              Search files
            </label>
            <input
              id="media-search"
              name="q"
              type="search"
              defaultValue={search}
              placeholder="File name"
              className="h-10 w-56 rounded-sm border border-line-strong bg-bg-surface px-3 text-sm text-fg placeholder:text-fg-muted"
            />
          </div>
          <button
            type="submit"
            className="h-10 rounded-sm border border-line-strong px-4 text-sm font-medium text-fg transition-colors hover:border-fg"
          >
            Search
          </button>
        </form>
      </div>

      {files.length === 0 ? (
        <div className="rounded-sm border border-dashed border-line-strong px-6 py-14 text-center">
          <h3 className="font-display text-xl text-fg">Nothing matches that</h3>
          <p className="mx-auto mt-2 max-w-[46ch] text-sm text-fg-muted">
            Try a different folder, or clear the search.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {files.map((file) => (
            <li key={file.id} className="overflow-hidden rounded-sm border border-line bg-bg">
              <div className="relative aspect-[4/3] bg-bg-deep">
                <Image
                  src={file.url}
                  alt={file.originalName || file.filename}
                  fill
                  sizes="(max-width: 640px) 100vw, 20rem"
                  className="object-contain"
                />
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-medium text-fg" title={file.originalName || file.filename}>
                  {file.originalName || file.filename}
                </p>
                <p className="mt-1 text-xs text-fg-muted">
                  {file.folder} · {formatSize(file.size)}
                  {file.createdAt ? ` · ${formatShortDate(file.createdAt)}` : ""}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => copyUrl(file.url)}
                    className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-sm border border-line-strong text-[0.8125rem] font-medium text-fg transition-colors hover:border-fg"
                  >
                    <Copy size={14} aria-hidden />
                    Copy link
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(file)}
                    aria-label={`Delete ${file.originalName || file.filename}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-line-strong text-fg-muted transition-colors hover:border-accent hover:text-accent"
                  >
                    <Trash size={14} aria-hidden />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {pendingDelete ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-5">
          <button
            type="button"
            aria-label="Cancel"
            tabIndex={-1}
            onClick={() => setPendingDelete(null)}
            className="absolute inset-0 h-full w-full cursor-default bg-indigo-900/50"
          />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="media-delete-title"
            className="relative w-full max-w-md rounded-sm border border-line bg-bg p-6 shadow-2xl"
          >
            <h2 id="media-delete-title" className="font-display text-xl text-fg">
              Delete this file?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">
              Any page still pointing at it will fall back to showing no image. This cannot be
              undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className={buttonClasses("secondary", "md", "px-4")}
              >
                Keep it
              </button>
              <form action={deleteAction} onSubmit={() => setPendingDelete(null)}>
                <input type="hidden" name="folder" value={pendingDelete.folder} />
                <input type="hidden" name="filename" value={pendingDelete.filename} />
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

function FolderTab({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex h-9 items-center rounded-sm border px-3 text-[0.8125rem] font-medium capitalize transition-colors",
        active
          ? "border-brand bg-brand/[0.10] text-brand"
          : "border-line-strong text-fg-muted hover:border-fg hover:text-fg",
      )}
    >
      {label}
    </Link>
  );
}
