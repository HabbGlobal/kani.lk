import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The uploaded logo mark (kani.lk wordmark + K glyph, baked into one image),
 * shown on a small rounded white chip so it stays legible on the dark
 * sidebar/navbar surfaces too — the artwork itself isn't theme-aware.
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
    <span className={cn("inline-flex items-center gap-2 leading-none", className)}>
      <span
        className={cn(
          "relative inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center overflow-hidden rounded-[9px] sm:h-[40px] sm:w-[40px]",
          onDark ? "bg-white p-[3px] shadow-[0_1px_2px_rgba(0,0,0,0.25)]" : "bg-transparent"
        )}
      >
        <Image src="/logo.png" alt="kani.lk" fill sizes="40px" className="object-contain" priority />
      </span>
      {withTagline && (
        <span
          className={cn(
            "text-[10px] font-medium uppercase tracking-[0.28em]",
            onDark ? "text-white/70" : "text-[var(--muted)]"
          )}
        >
          Find. Invest. Own.
        </span>
      )}
    </span>
  );
}
