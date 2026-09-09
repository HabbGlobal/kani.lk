import { LandCard } from "@/components/land/LandCard";
import { Reveal } from "@/components/ui/Reveal";
import type { LandCard as LandCardType } from "@/lib/queries";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/**
 * Horizontal card rail on mobile, grid on desktop. Snap scrolling on touch so a
 * flick lands cleanly on the next card rather than halfway between two.
 */
export function LandRail({
  lands,
  locale = DEFAULT_LOCALE,
  priority = false,
  className,
}: {
  lands: LandCardType[];
  locale?: Locale;
  priority?: boolean;
  className?: string;
}) {
  if (lands.length === 0) return null;

  return (
    <>
      {/* Mobile: rail */}
      <ul
        className={cn(
          "rail -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 md:hidden",
          className
        )}
      >
        {lands.map((land, i) => (
          <li key={land._id} className="w-[80vw] max-w-[330px] shrink-0">
            <LandCard
              land={land}
              locale={locale}
              priority={priority && i === 0}
              sizes="80vw"
            />
          </li>
        ))}
      </ul>

      {/* Desktop: grid with a staggered reveal */}
      <ul
        className={cn(
          "hidden gap-5 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
          className
        )}
      >
        {lands.map((land, i) => (
          <Reveal as="li" key={land._id} delay={Math.min(i * 55, 220)}>
            <LandCard
              land={land}
              locale={locale}
              priority={priority && i < 2}
              sizes="(min-width: 1280px) 290px, (min-width: 1024px) 30vw, 45vw"
            />
          </Reveal>
        ))}
      </ul>
    </>
  );
}

/** Plain responsive grid — used on browse, district and favourites pages. */
export function LandGrid({
  lands,
  locale = DEFAULT_LOCALE,
  priorityCount = 2,
}: {
  lands: LandCardType[];
  locale?: Locale;
  priorityCount?: number;
}) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {lands.map((land, i) => (
        <Reveal as="li" key={land._id} delay={Math.min((i % 6) * 50, 200)}>
          <LandCard
            land={land}
            locale={locale}
            priority={i < priorityCount}
            sizes="(min-width: 1280px) 380px, (min-width: 640px) 45vw, 92vw"
          />
        </Reveal>
      ))}
    </ul>
  );
}
