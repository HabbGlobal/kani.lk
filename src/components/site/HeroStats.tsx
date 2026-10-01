import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";

/**
 * Compact stat pills under the hero CTAs. Every value is real application
 * data passed in by the caller — nothing here is invented copy.
 */
export function HeroStats({
  listings,
  districts,
  categories,
  locale = DEFAULT_LOCALE,
}: {
  listings: number;
  districts: number;
  categories: number;
  locale?: Locale;
}) {
  const d = getDictionary(locale);
  const stats = [
    {
      value: String(listings),
      label: listings === 1 ? d.home.activeListing : d.home.activeListings,
    },
    {
      value: String(districts),
      label: districts === 1 ? d.home.districtCovered : d.home.districtsCovered,
    },
    {
      value: String(categories),
      label:
        categories === 1 ? d.home.propertyCategory : d.home.propertyCategories,
    },
    { value: d.home.direct, label: d.home.ownerContact },
  ];

  return (
    // Even 2x2 grid on mobile, where four variable-width flex items can wrap
    // unevenly in a narrow column; back to the original flex-wrap from `sm`
    // up, unchanged.
    <ul className="kani-hero-stats mt-4 grid grid-cols-2 gap-1.5 sm:mt-5 sm:flex sm:flex-wrap sm:gap-2">
      {stats.map((s) => (
        <li
          key={s.label}
          className="flex items-baseline gap-1.5 rounded-[var(--radius-md)] border border-white/30
                     bg-black/45 px-2.5 py-1.5 backdrop-blur-md sm:px-3"
        >
          <span className="font-serif text-[14px] font-bold leading-none text-[var(--palmyra-gold-soft)] sm:text-[15px]">
            {s.value}
          </span>
          <span className="text-[11px] font-semibold leading-none text-white sm:text-[12px]">{s.label}</span>
        </li>
      ))}
    </ul>
  );
}
