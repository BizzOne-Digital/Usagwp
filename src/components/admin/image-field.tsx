"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { CircleNotch, ImageSquare, Trash, UploadSimple } from "@phosphor-icons/react";

import { useToast } from "@/components/admin/toast";
import { resolveImageUrl } from "@/lib/uploads/resolve-image-url";

const ACCEPTED = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_BYTES = 8 * 1024 * 1024;

type Props = {
  name: string;
  label: string;
  folder: "products" | "gallery" | "pages" | "misc";
  defaultValue?: string;
  hint?: string;
  onChange?: (url: string) => void;
};

/**
 * Admin image field. Uploads go straight to /api/upload, which stores the bytes
 * in MongoDB and returns the public URL. Only that URL string is submitted with
 * the form, so no binary is ever duplicated onto the content document.
 */
export function ImageField({ name, label, folder, defaultValue = "", hint, onChange }: Props) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const [value, setValue] = useState(defaultValue);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");

  const preview = resolveImageUrl(value);
  const uploading = progress !== null;

  function update(next: string) {
    setValue(next);
    onChange?.(next);
  }

  function upload(file: File) {
    setError("");

    if (!ACCEPTED.includes(file.type)) {
      setError("Choose a PNG, JPEG, WebP or GIF image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("That image is larger than 8MB. Please choose a smaller file.");
      return;
    }

    const body = new FormData();
    body.append("file", file);
    body.append("folder", folder);

    // XHR rather than fetch, because fetch cannot report upload progress.
    const request = new XMLHttpRequest();
    setProgress(0);

    request.upload.addEventListener("progress", (event) => {
      if (!event.lengthComputable) return;
      setProgress(Math.round((event.loaded / event.total) * 100));
    });

    request.addEventListener("load", () => {
      setProgress(null);
      let payload: { success?: boolean; url?: string; error?: string } = {};
      try {
        payload = JSON.parse(request.responseText);
      } catch {
        /* handled below */
      }

      if (request.status >= 200 && request.status < 300 && payload.success && payload.url) {
        update(payload.url);
        toast.push({ tone: "success", message: "Image uploaded." });
      } else {
        const message = payload.error ?? "The upload failed. Please try again.";
        setError(message);
        toast.push({ tone: "error", message });
      }
      if (fileRef.current) fileRef.current.value = "";
    });

    request.addEventListener("error", () => {
      setProgress(null);
      setError("The upload failed. Please check your connection.");
      toast.push({ tone: "error", message: "The upload failed." });
    });

    request.open("POST", "/api/upload");
    request.send(body);
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-fg">{label}</span>

      {/* Only the resulting URL is part of the form payload. */}
      <input type="hidden" name={name} value={value} readOnly />

      <div className="overflow-hidden rounded-sm border border-line-strong bg-bg-surface">
        <div className="relative flex aspect-[16/9] items-center justify-center bg-bg-deep">
          {preview ? (
            <Image
              src={preview}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 24rem"
              className="object-contain"
            />
          ) : (
            <span className="flex flex-col items-center gap-2 text-fg-muted">
              <ImageSquare size={26} aria-hidden />
              <span className="text-sm">No image selected</span>
            </span>
          )}

          {uploading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-bg/85">
              <p className="flex items-center gap-2 text-sm font-medium text-fg">
                <CircleNotch size={16} className="animate-spin" aria-hidden />
                Uploading {progress}%
              </p>
              <div
                role="progressbar"
                aria-valuenow={progress ?? 0}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Upload progress"
                className="h-1 w-40 overflow-hidden rounded-sm bg-line"
              >
                <div
                  className="h-full bg-accent transition-[width] duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2 border-t border-line p-2">
          <label
            htmlFor={inputId}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-sm border border-line-strong px-3 text-[0.8125rem] font-medium text-fg transition-colors hover:border-fg"
          >
            <UploadSimple size={15} aria-hidden />
            {preview ? "Replace" : "Upload"}
          </label>
          <input
            ref={fileRef}
            id={inputId}
            type="file"
            accept={ACCEPTED.join(",")}
            className="sr-only"
            disabled={uploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) upload(file);
            }}
          />

          {preview ? (
            <button
              type="button"
              disabled={uploading}
              onClick={() => {
                // Clears the reference now. The stored file is deleted on save,
                // once the form knows the image really was removed.
                update("");
                setError("");
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-line-strong px-3 text-[0.8125rem] font-medium text-fg transition-colors hover:border-accent hover:text-accent"
            >
              <Trash size={15} aria-hidden />
              Remove
            </button>
          ) : null}
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-accent-strong">
          {error}
        </p>
      ) : null}
      {hint && !error ? <p className="text-sm text-fg-muted">{hint}</p> : null}
    </div>
  );
}
