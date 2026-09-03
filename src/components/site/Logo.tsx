import { cn } from "@/lib/utils";

/**
 * Wordmark. Serif "kani" in green with a gold ".lk", matching the logo.
 * Rendered as text rather than an image so it stays crisp at every size and
 * costs no request — the full logo art is used for the favicon and OG image.
 */
export function Logo({
  className,
  onDark = false,
  withTagline = false,
}: {
  className?: string;
  onDark?: boolean;
  withTagline?: boolean;
}) {
  return (
    <span className={cn("inline-flex flex-col leading-none", className)}>
      <span className="inline-flex items-baseline gap-[1px]">
        <MarkGlyph className="mr-1.5 size-[1.15em] self-center" onDark={onDark} />
        <span
          className={cn(
            "font-serif text-[26px] font-semibold tracking-[-0.02em]",
            onDark ? "text-white" : "text-[var(--kani-green)]"
          )}
        >
          kani
        </span>
        <span className="font-serif text-[26px] font-semibold tracking-[-0.02em] text-[var(--palmyra-gold)]">
          .lk
        </span>
      </span>
      {withTagline && (
        <span
          className={cn(
            "mt-1 text-[10px] font-medium uppercase tracking-[0.28em]",
            onDark ? "text-white/70" : "text-[var(--muted)]"
          )}
        >
          Find. Invest. Own.
        </span>
      )}
    </span>
  );
}

/** The K + paddy furrows + palmyra roofline, reduced to a single glyph. */
export function MarkGlyph({
  className,
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" aria-hidden="true">
      <path
        d="M6 20 L13 14 L20 20"
        stroke="var(--palmyra-gold)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 30 C11 26 18 25 30 24"
        stroke="var(--paddy)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M6 35 C14 31 22 30 34 29"
        stroke="var(--palmyra-gold)"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.9"
      />
      <g fill={onDark ? "#ffffff" : "var(--kani-green)"}>
        <rect x="24" y="5" width="3.6" height="22" rx="1" />
        <path d="M27.6 15.6 L34.5 5 H38 L31 16 Z" />
        <path d="M27.6 15 L35 27 H31.4 L27.6 20.4 Z" />
      </g>
    </svg>
  );
}
