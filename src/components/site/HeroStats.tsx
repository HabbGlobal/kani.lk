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
    <ul className="kani-hero-stats mt-5 flex flex-wrap gap-2">
      {stats.map((s) => (
        <li
          key={s.label}
          className="flex items-baseline gap-1.5 rounded-[var(--radius-md)] border border-white/20
                     bg-white/10 px-3 py-1.5 backdrop-blur-md"
        >
          <span className="font-serif text-[15px] leading-none text-[var(--palmyra-gold-soft)]">
            {s.value}
          </span>
          <span className="text-[12px] leading-none text-white/80">{s.label}</span>
        </li>
      ))}
    </ul>
  );
}
