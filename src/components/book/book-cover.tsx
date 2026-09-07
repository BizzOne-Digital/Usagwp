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
 * the printer. Both states share the same footprint, so swapping in the artwork
 * causes no layout shift.
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

  return (
    <div
      className={cn(
        "relative aspect-[2/3] w-full overflow-hidden rounded-sm",
        "shadow-[0_28px_60px_-24px_rgba(16,25,43,0.45)]",
        "ring-1 ring-indigo-900/12",
        className,
      )}
    >
      {resolved ? (
        <Image
          src={resolved}
          alt={alt?.trim() || `Cover of ${title} by ${author}`}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover"
        />
      ) : (
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
      )}
    </div>
  );
}
