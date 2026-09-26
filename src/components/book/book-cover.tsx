import Image from "next/image";

import { cn } from "@/lib/cn";
import { resolveImageUrl } from "@/lib/uploads/resolve-image-url";

type Props = {
  src?: string | null;
  alt?: string;
  title: string;
  author: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
};

/**
 * Renders the real cover once one is uploaded in the CMS. Until then it renders
 * a typographic stand-in built from the book's own metadata rather than a broken
 * image or a grey box, so the page reads as finished while the cover is still at
 * the printer.
 *
 * The uploaded artwork keeps its own aspect ratio rather than being forced into
 * the stand-in's 2:3 portrait frame: a landscape mockup showing front and back
 * covers is a legitimate upload, and cropping it to a portrait slice hid most
 * of it. width/height of 0 with `sizes` is next/image's documented way to say
 * "the file decides the ratio" while keeping optimisation.
 */
export function BookCover({
  src,
  alt,
  title,
  author,
  priority = false,
  className,
  sizes = "(max-width: 768px) 70vw, 30vw",
}: Props) {
  const resolved = resolveImageUrl(src);

  const frame = cn(
    "w-full rounded-sm",
    "shadow-[0_28px_60px_-24px_rgba(16,25,43,0.45)]",
    "ring-1 ring-indigo-900/12",
    className,
  );

  if (resolved) {
    return (
      <Image
        src={resolved}
        alt={alt?.trim() || `Cover of ${title} by ${author}`}
        width={0}
        height={0}
        priority={priority}
        sizes={sizes}
        className={cn(frame, "h-auto")}
      />
    );
  }

  return (
    <div className={cn(frame, "relative aspect-[2/3] overflow-hidden")}>
      <div className="flex h-full w-full flex-col justify-between bg-indigo-800 p-[7%] text-fg-inverse">
          <span
            aria-hidden
            className="thread-rule h-full w-px absolute left-[13%] top-0 opacity-70"
          />
          <p className="relative font-sans text-[0.6rem] uppercase tracking-[0.3em] text-indigo-100/75">
            A true story
          </p>
          <p className="relative font-display text-[clamp(1.25rem,3.2vw,2.1rem)] leading-[1.12]">
            {title}
          </p>
          <p className="relative font-sans text-[0.7rem] uppercase tracking-[0.22em] text-indigo-100/85">
            {author}
          </p>
      </div>
    </div>
  );
}
