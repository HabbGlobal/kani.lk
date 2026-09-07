import { cn } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import type { LandStatus, Purpose } from "@/models/types";

/**
 * Purpose must be readable from the image alone, before any text — the client's
 * explicit requirement. Sale is solid green, rent is solid gold, and "both" is
 * a split pill, which is the one memorable move on the card.
 */
export function PurposeBadge({
  purpose,
  className,
  size = "md",
  locale = DEFAULT_LOCALE,
}: {
  purpose: Purpose;
  className?: string;
  size?: "sm" | "md";
  locale?: Locale;
}) {
  const d = getDictionary(locale);
  const pad = size === "sm" ? "px-2.5 py-1 text-[12px]" : "px-3 py-1.5 text-[13px]";
  const shell =
    "inline-flex items-center rounded-[var(--radius-pill)] font-semibold tracking-tight " +
    "shadow-[0_2px_8px_rgba(10,44,30,0.28)] backdrop-blur-[2px]";

  if (purpose === "both") {
    return (
      <span className={cn(shell, "overflow-hidden p-0", className)}>
        <span className={cn("bg-[var(--kani-green)] text-white", pad)}>
          {d.land.forSale}
        </span>
        <span className={cn("bg-[var(--palmyra-gold)] text-[var(--kani-green-deep)]", pad)}>
          {d.land.badgeOrRent}
        </span>
      </span>
    );
  }

  if (purpose === "rent") {
    return (
      <span className={cn(shell, "bg-[var(--palmyra-gold)] text-[var(--kani-green-deep)]", pad, className)}>
        {d.land.forRent}
      </span>
    );
  }

  return (
    <span className={cn(shell, "bg-[var(--kani-green)] text-white", pad, className)}>
      {d.land.forSale}
    </span>
  );
}

/**
 * Status ribbon across the top-left corner of the cover photo. Laterite for the
 * terminal states, gold for reserved — which keeps full colour, because it may
 * come back to market.
 */
export function StatusRibbon({
  status,
  locale = DEFAULT_LOCALE,
}: {
  status: LandStatus;
  locale?: Locale;
}) {
  if (status === "available") return null;

  const d = getDictionary(locale);
  const label =
    status === "sold" ? d.land.sold : status === "rented" ? d.land.rented : d.land.reserved;
  const bg = status === "reserved" ? "var(--palmyra-gold)" : "var(--laterite)";
  const fg = status === "reserved" ? "var(--kani-green-deep)" : "#fff";

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute -left-12 top-5 z-20 w-44 -rotate-45
                 py-1.5 text-center text-[13px] font-bold uppercase tracking-[0.14em]
                 shadow-[0_2px_10px_rgba(10,44,30,0.35)]"
      style={{ background: bg, color: fg }}
    >
      {label}
    </span>
  );
}

/** Small neutral chip used for deed type, road width, features. */
export function Chip({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "green" | "gold" | "laterite";
  className?: string;
}) {
  const tones = {
    neutral: "bg-black/[0.045] text-[var(--muted)]",
    green: "bg-[var(--kani-green)]/10 text-[var(--kani-green)]",
    gold: "bg-[var(--palmyra-gold)]/18 text-[#7a6127]",
    laterite: "bg-[var(--laterite)]/12 text-[var(--laterite)]",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-2.5 py-1 text-[13px] font-medium",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/** Availability dot + label for the detail page. */
export function StatusPill({
  status,
  locale = DEFAULT_LOCALE,
}: {
  status: LandStatus;
  locale?: Locale;
}) {
  const d = getDictionary(locale);
  const map = {
    available: { label: d.land.available, color: "var(--paddy)" },
    reserved: { label: d.land.reserved, color: "var(--palmyra-gold)" },
    sold: { label: d.land.sold, color: "var(--laterite)" },
    rented: { label: d.land.rented, color: "var(--laterite)" },
  } as const;
  const { label, color } = map[status];

  return (
    <span className="inline-flex items-center gap-2 text-[14px] font-medium text-[var(--muted)]">
      <span
        className="size-2.5 rounded-full"
        style={{ background: color }}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
