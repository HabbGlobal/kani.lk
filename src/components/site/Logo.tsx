import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The uploaded mark (a K built from a house-and-skyline glyph, gold over
 * two-tone green) paired with a set "kani.lk" wordmark — "kani" in the same
 * deep green as the mark, ".lk" in the same gold, so the type reads as part
 * of the same logo rather than a generic heading font next to an icon.
 *
 * The source art is transparent but sized on a much larger blank canvas, and
 * its deep green (#004830) is only 1.92:1 against a black bar — invisible,
 * not just dim. `navbar-logo.png` / `navbar-logo-light.png` are pre-trimmed
 * to the actual artwork bounds, with the light variant's green lifted to the
 * site's paddy green for the dark navbar. No background chip needed — both
 * files render straight on top of any surface.
 */
export function Logo({
  className,
  onDark = false,
  withTagline = false,
  /** Text shown when `withTagline` is set. Passed in rather than looked up
   * here, since `Logo` also renders in the admin login screen with no
   * locale context — callers on the public site pass `d.common.tagline`. */
  tagline = "Find. Invest. Own.",
  /** Mark only, no wordmark — for tight spaces like a collapsed sidebar rail. */
  iconOnly = false,
  /** Wordmark only, no mark image — used in the landing-page navbar. */
  hideMark = false,
}: {
  className?: string;
  onDark?: boolean;
  withTagline?: boolean;
  tagline?: string;
  iconOnly?: boolean;
  hideMark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 leading-none", className)}>
      {!hideMark && (
        <span className="relative inline-flex h-[36px] w-auto shrink-0 items-center sm:h-[42px]">
          <Image
            src={onDark ? "/navbar-logo-light.png" : "/navbar-logo.png"}
            alt={iconOnly ? "kani.lk" : ""}
            width={1170}
            height={811}
            className="h-full w-auto object-contain"
            priority
          />
        </span>
      )}

      {iconOnly ? (
        <span className="sr-only">kani.lk</span>
      ) : (
        // The mark's ink sits well below its own geometric center (the wide
        // field curves at the base outweigh the thin buildings up top), so
        // centering the wordmark on the mark's *box* reads as too high —
        // this nudges it down to the mark's visual center instead.
        <span className="flex translate-y-[3px] flex-col justify-center sm:translate-y-[3.5px]">
          <span
            className="font-serif text-[21px] font-semibold leading-none sm:text-[24px]"
            style={{ letterSpacing: "-0.01em" }}
          >
            <span style={{ color: onDark ? "var(--palmyra-gold-soft)" : "var(--kani-green-deep)" }}>
              kani
            </span>
            <span style={{ color: onDark ? "var(--paddy)" : "var(--kani-green)" }}>.lk</span>
          </span>
          {withTagline && (
            <span
              className={cn(
                "text-[10px] font-medium uppercase tracking-[0.28em]",
                onDark ? "text-white/70" : "text-[var(--muted)]"
              )}
            >
              {tagline}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
