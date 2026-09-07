import Link from "next/link";
import { Select } from "@/components/ui/Field";
import { getDictionary, interpolate } from "@/lib/i18n";
import { DEFAULT_LOCALE, localeHref, type Locale } from "@/lib/i18n/config";
import { localizedName } from "@/lib/i18n/localized";

/**
 * The hero search. Deliberately a plain GET form to /lands with no JavaScript
 * at all — it works with JS disabled, on a slow connection, and before hydration.
 * Every control is a native element the browser already knows how to submit.
 */
export function HeroSearch({
  districts,
  landTypes,
  locale = DEFAULT_LOCALE,
}: {
  districts: { _id: string; name: string; nameTa?: string; slug: string }[];
  landTypes: { _id: string; name: string; nameTa?: string; slug: string }[];
  locale?: Locale;
}) {
  const d = getDictionary(locale);
  const href = (path: string) => localeHref(path, locale);

  return (
    <div className="kani-hero-search-glow relative rounded-[22px] p-[2.5px]">
      {/* Rotating gold beam, CSS-only — a conic-gradient arc masked down to a
          thin ring around the panel. Purely decorative: sits behind the form
          in paint order and never intercepts pointer or focus events. */}
      <div aria-hidden="true" className="kani-hero-search-beam absolute inset-0 rounded-[22px]" />
      <form
        action={href("/lands")}
        method="get"
        className="kani-hero-search-panel relative rounded-[20px] border border-black/[0.06] bg-[var(--card)]
                   p-3 shadow-[0_16px_40px_-16px_rgba(10,44,30,0.35)] sm:p-4"
      >
      {/* Purpose: real radios, styled as compact tabs. */}
      <fieldset className="mb-3 border-b border-black/[0.08] pb-3">
        <legend className="sr-only">{d.lands.purpose}</legend>
        <div className="flex gap-1">
          {[
            { value: "", label: d.common.all },
            { value: "sale", label: d.land.forSale },
            { value: "rent", label: d.land.forRent },
          ].map((opt, i) => (
            <label
              key={opt.label}
              className="kani-hero-tab cursor-pointer rounded-[var(--radius-md)] px-3 py-1.5 text-center
                         text-[14px] font-medium text-[var(--muted)]
                         transition-colors duration-200 [transition-timing-function:var(--ease-out)]
                         hover:text-[var(--kani-green)]
                         has-[:checked]:text-[var(--kani-green)]
                         has-[:checked]:border-b-2 has-[:checked]:border-[var(--kani-green)]
                         has-[:focus-visible]:outline has-[:focus-visible]:outline-2
                         has-[:focus-visible]:outline-offset-2"
            >
              {/* Native radio semantics already expose selection to assistive
                  tech correctly — a live aria-selected toggle would need
                  client JS, which this zero-JS form deliberately avoids. */}
              <input
                type="radio"
                name="purpose"
                value={opt.value}
                defaultChecked={i === 0}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.2fr_1.2fr_1fr_1fr_auto] lg:items-end">
        <div>
          <label htmlFor="hero-district" className="mb-1.5 block text-[12.5px] font-medium text-[var(--muted)]">
            {d.land.location}
          </label>
          <Select id="hero-district" name="district" defaultValue="" className="h-11 text-[15px]">
            <option value="">{d.home.heroAnyDistrict}</option>
            {districts.map((district) => (
              <option key={district._id} value={district.slug}>
                {localizedName(district, locale)}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label htmlFor="hero-type" className="mb-1.5 block text-[12.5px] font-medium text-[var(--muted)]">
            {d.home.propertyType}
          </label>
          <Select id="hero-type" name="landType" defaultValue="" className="h-11 text-[15px]">
            <option value="">{d.home.heroAnyLandType}</option>
            {landTypes.map((type) => (
              <option key={type._id} value={type.slug}>
                {localizedName(type, locale)}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label htmlFor="hero-min" className="mb-1.5 block text-[12.5px] font-medium text-[var(--muted)]">
            {d.home.minimumLandSize}
          </label>
          <Select id="hero-min" name="minPerch" defaultValue="" className="h-11 text-[15px]">
            <option value="">{d.home.heroMinSize}</option>
            {[5, 10, 15, 20, 40, 80, 160].map((p) => (
              <option key={p} value={p}>{p}+ perches</option>
            ))}
          </Select>
        </div>

        <div>
          <label htmlFor="hero-max" className="mb-1.5 block text-[12.5px] font-medium text-[var(--muted)]">
            {d.home.maximumLandSize}
          </label>
          <Select id="hero-max" name="maxPerch" defaultValue="" className="h-11 text-[15px]">
            <option value="">{d.home.heroMaxSize}</option>
            {[10, 20, 40, 80, 160, 320, 800].map((p) => (
              <option key={p} value={p}>
                {p >= 160 ? `${p / 160} acres` : `${p} perches`}
              </option>
            ))}
          </Select>
        </div>

        <button
          type="submit"
          className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2
                     rounded-[var(--radius-pill)] bg-[var(--kani-green)] px-6 text-[15px] font-medium text-white
                     transition-[background-color,transform] duration-200
                     [transition-timing-function:var(--ease-out)]
                     hover:bg-[var(--kani-green-deep)] active:scale-[0.97]
                     focus-visible:outline-2 focus-visible:outline-offset-2 lg:w-auto"
        >
          <svg viewBox="0 0 20 20" className="size-4 shrink-0" fill="none" aria-hidden="true">
            <circle cx="8.75" cy="8.75" r="5.75" stroke="currentColor" strokeWidth="1.8" />
            <path d="M13 13l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          {d.common.search}
        </button>
      </div>

      <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[13px] text-[var(--muted)]">
        <span>{d.home.heroPopular}</span>
        {[
          {
            label: interpolate(d.home.heroLandIn, { name: "Vavuniya" }),
            href: href("/districts/vavuniya"),
          },
          { label: d.home.heroPaddy, href: href("/lands?landType=paddy-land") },
          { label: d.home.heroUnder20, href: href("/lands?maxPerch=20") },
          {
            label: d.home.heroHousesForRent,
            href: href("/lands?purpose=rent&landType=house-and-land"),
          },
        ].map((chip) => (
          <Link
            key={chip.label}
            href={chip.href}
            className="kani-hero-quick-filter rounded-[var(--radius-pill)] bg-black/[0.045] px-2.5 py-1 text-[var(--ink)]
                       transition-colors hover:bg-[var(--kani-green)]/10 hover:text-[var(--kani-green)]"
          >
            {chip.label}
          </Link>
        ))}
      </p>
      </form>
    </div>
  );
}
