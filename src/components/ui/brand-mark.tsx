/**
 * USAGWP brand mark.
 *
 * The client has no existing logo. The mark is the book's own metaphor drawn as
 * simply as possible: a woven band (the fabric) crossed by one continuous
 * vertical thread that runs past the weave on both sides. It reads at 16px as a
 * small ruled square with a stroke through it, which keeps it usable as a
 * favicon and a social avatar, and it supports the cover rather than competing
 * with it.
 */
export function BrandMark({
  className,
  title = "Edmond Kelly",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      role="img"
      aria-label={title}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* the fabric */}
      <rect
        x="4.75"
        y="7.75"
        width="22.5"
        height="16.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* the weave */}
      <path
        d="M4.75 13.25h22.5M4.75 18.75h22.5"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.45"
      />
      {/* the one thread */}
      <path
        d="M16 2.5v27"
        stroke="var(--accent)"
        strokeWidth="1.75"
        strokeLinecap="square"
      />
    </svg>
  );
}
