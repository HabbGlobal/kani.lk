"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Checkbox } from "@/components/ui/Field";
import { DEED_TYPES, type DeedType } from "@/models/types";
import { useI18n } from "@/lib/i18n/client";
import { localizedName } from "@/lib/i18n/localized";
import * as EnumLabel from "@/lib/i18n/enums";
import { cn } from "@/lib/utils";

type Taxonomy = { _id: string; name: string; nameTa?: string; slug: string }[];

const PERCH_STEPS = [5, 10, 15, 20, 40, 80, 160, 320, 800];
const PRICE_STEPS = [
  500_000, 1_000_000, 2_000_000, 3_000_000, 5_000_000,
  10_000_000, 20_000_000, 50_000_000,
];

/** A native select restyled to sit directly on the light filter card — the
 * shared `Select` component is deliberately fixed-white too, but this one
 * is sized and spaced to match the sidebar's compact triggers. Full width
 * here since the sidebar stacks fields vertically rather than inline. */
function BarSelect({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "h-10 w-full cursor-pointer appearance-none rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--bone)]",
        "pl-3.5 pr-8 text-[13.5px] font-medium text-[var(--ink)]",
        "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22 fill=%22none%22><path d=%22M4 6l4 4 4-4%22 stroke=%22%23566a5f%22 stroke-width=%221.6%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/></svg>')] bg-[length:14px] bg-[right_10px_center] bg-no-repeat",
        "transition-colors duration-200 hover:border-[var(--kani-green)]/40",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kani-green)]",
        className
      )}
    >
      {props.children}
    </select>
  );
}

/** A labeled group inside the sidebar — keeps the label/control rhythm
 * consistent without pulling in the light-only `Field` (which sizes for the
 * mobile sheet's wider layout, not this narrower column). */
function BarField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="text-[12.5px] font-semibold uppercase tracking-[0.06em] text-[var(--muted)]"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

/**
 * Filters read and write the URL directly — no local mirror of the state, so
 * the back button, a shared link and a refresh all behave identically.
 */
export function FilterPanel({
  districts,
  cities,
  landTypes,
  resultCount,
}: {
  districts: Taxonomy;
  cities: (Taxonomy[number] & { district: string })[];
  landTypes: Taxonomy;
  resultCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { d, t, locale } = useI18n();
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const get = useCallback((k: string) => params.get(k) ?? "", [params]);

  const setParam = useCallback(
    (updates: Record<string, string | null>) => {
      const sp = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v == null || v === "") sp.delete(k);
        else sp.set(k, v);
      }
      // Any filter change returns to page one; page 3 of the old result set is
      // meaningless against a new one.
      sp.delete("page");
      startTransition(() => {
        router.push(`${pathname}${sp.toString() ? `?${sp}` : ""}`, { scroll: false });
      });
    },
    [params, pathname, router]
  );

  // Cities are meaningless without a district, so the list narrows to it.
  const districtSlug = get("district");
  const purpose = get("purpose");
  const visibleCities = useMemo(() => {
    if (!districtSlug) return [];
    const d = districts.find((x) => x.slug === districtSlug);
    return d ? cities.filter((c) => c.district === d._id) : [];
  }, [districtSlug, districts, cities]);

  // Everything the compact bar/pill doesn't have room for — reached through
  // "More filters", on both desktop and mobile, so there's one form to keep
  // in sync rather than two.
  const moreControls = (
    <div className="space-y-5">
      <Field
        label={d.lands.keyword}
        htmlFor="f-q"
        hint={d.lands.keywordHint}
      >
        <Input
          id="f-q"
          type="search"
          name="q"
          defaultValue={get("q")}
          placeholder={d.lands.keywordPlaceholder}
          onBlur={(e) => setParam({ q: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              setParam({ q: (e.target as HTMLInputElement).value });
            }
          }}
        />
      </Field>

      {visibleCities.length > 0 && (
        <Field label={d.lands.cityOrTown} htmlFor="f-city">
          <Select
            id="f-city"
            value={get("city")}
            onChange={(e) => setParam({ city: e.target.value })}
          >
            <option value="">{d.lands.anywhereInDistrict}</option>
            {visibleCities.map((c) => (
              <option key={c._id} value={c.slug}>
                {localizedName(c, locale)}
              </option>
            ))}
          </Select>
        </Field>
      )}

      <Field label={d.lands.deedType} htmlFor="f-deed">
        <Select
          id="f-deed"
          value={get("deedType")}
          onChange={(e) => setParam({ deedType: e.target.value })}
        >
          <option value="">{d.lands.anyDeedType}</option>
          {DEED_TYPES.map((value: DeedType) => (
            <option key={value} value={value}>
              {EnumLabel.DEED_TYPE[locale][value]}
            </option>
          ))}
        </Select>
      </Field>

      <Field label={d.lands.roadAccess} htmlFor="f-road">
        <Select
          id="f-road"
          value={get("minRoadFt")}
          onChange={(e) => setParam({ minRoadFt: e.target.value })}
        >
          <option value="">{d.lands.anyRoadWidth}</option>
          {[10, 12, 15, 20, 30].map((ft) => (
            <option key={ft} value={ft}>
              {t(d.lands.roadOrWider, { ft })}
            </option>
          ))}
        </Select>
      </Field>

      <fieldset className="space-y-1">
        <legend className="mb-1 text-[14px] font-medium text-[var(--ink)]">
          Utilities
        </legend>
        <Checkbox
          label={d.lands.electricityAtBoundary}
          checked={get("electricity") === "1"}
          onChange={(e) => setParam({ electricity: e.target.checked ? "1" : null })}
        />
        <Checkbox
          label={d.lands.waterCheckbox}
          checked={get("water") === "1"}
          onChange={(e) => setParam({ water: e.target.checked ? "1" : null })}
        />
      </fieldset>

      <div className="border-t border-[var(--hairline)] pt-4">
        <Checkbox
          label={d.lands.includeSoldCheckbox}
          checked={get("includeSold") === "1"}
          onChange={(e) => setParam({ includeSold: e.target.checked ? "1" : null })}
        />
      </div>
    </div>
  );

  // The full field set, used as-is inside the mobile Sheet (which has room
  // to stack everything vertically, unlike the desktop bar).
  const allControlsForSheet = (
    <div className="space-y-5">
      <Field label={d.lands.purpose} htmlFor="f-purpose-sheet">
        <Select
          id="f-purpose-sheet"
          value={purpose}
          onChange={(e) => setParam({ purpose: e.target.value })}
        >
          <option value="">{d.lands.forSaleOrRent}</option>
          <option value="sale">{d.land.forSale}</option>
          <option value="rent">{d.land.forRent}</option>
        </Select>
      </Field>

      <Field label={d.lands.district} htmlFor="f-district-sheet">
        <Select
          id="f-district-sheet"
          value={districtSlug}
          onChange={(e) => setParam({ district: e.target.value, city: null })}
        >
          <option value="">{d.lands.allDistricts}</option>
          {districts.map((district) => (
            <option key={district._id} value={district.slug}>
              {localizedName(district, locale)}
            </option>
          ))}
        </Select>
      </Field>

      <Field label={d.lands.landType} htmlFor="f-type-sheet">
        <Select
          id="f-type-sheet"
          value={get("landType")}
          onChange={(e) => setParam({ landType: e.target.value })}
        >
          <option value="">{d.lands.allLandTypes}</option>
          {landTypes.map((type) => (
            <option key={type._id} value={type.slug}>
              {localizedName(type, locale)}
            </option>
          ))}
        </Select>
      </Field>

      <Field label={d.lands.sizePerches}>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <Select
            aria-label={d.lands.minSizeAria}
            value={get("minPerch")}
            onChange={(e) => setParam({ minPerch: e.target.value })}
          >
            <option value="">{d.lands.noMin}</option>
            {PERCH_STEPS.map((p) => (
              <option key={p} value={p}>{t(d.land.perchesValue, { n: p })}</option>
            ))}
          </Select>
          <span className="text-[var(--muted)]" aria-hidden="true">–</span>
          <Select
            aria-label={d.lands.maxSizeAria}
            value={get("maxPerch")}
            onChange={(e) => setParam({ maxPerch: e.target.value })}
          >
            <option value="">{d.lands.noMax}</option>
            {PERCH_STEPS.map((p) => (
              <option key={p} value={p}>{t(d.land.perchesValue, { n: p })}</option>
            ))}
          </Select>
        </div>
      </Field>

      <Field label={d.lands.priceLKR}>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <Select
            aria-label={d.lands.minPriceAria}
            value={get("minPrice")}
            onChange={(e) => setParam({ minPrice: e.target.value })}
          >
            <option value="">{d.lands.noMin}</option>
            {PRICE_STEPS.map((p) => (
              <option key={p} value={p}>{compactLKR(p)}</option>
            ))}
          </Select>
          <span className="text-[var(--muted)]" aria-hidden="true">–</span>
          <Select
            aria-label={d.lands.maxPriceAria}
            value={get("maxPrice")}
            onChange={(e) => setParam({ maxPrice: e.target.value })}
          >
            <option value="">{d.lands.noMax}</option>
            {PRICE_STEPS.map((p) => (
              <option key={p} value={p}>{compactLKR(p)}</option>
            ))}
          </Select>
        </div>
      </Field>

      {moreControls}
    </div>
  );

  return (
    <>
      {/* Desktop: one floating white card, sticky down the left column — same
          rounded-rectangle card language as the page header, just stacked
          vertically instead of laid out as a horizontal bar. No internal
          scroll/max-height here: the card's natural height is well under a
          normal viewport, and capping it just to add a scrollbar produced
          a visible scroll track and made the card feel "stuck" rather than
          truly fixed while scrolling. */}
      <aside
        className={cn(
          "hidden flex-col gap-5 rounded-[var(--radius-lg)] border border-[var(--hairline)] bg-[var(--card)] p-5 shadow-[var(--shadow-md)] lg:sticky lg:flex lg:[top:calc(var(--nav-h)+28px)]",
          pending && "opacity-60 transition-opacity duration-200"
        )}
        role="search"
        aria-label={d.lands.filterListings}
      >
        <BarField label={d.lands.purpose}>
          <div className="flex items-center gap-0.5 rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--bone)] p-1">
            {[
              { value: "", label: d.common.all },
              { value: "sale", label: d.land.forSale },
              { value: "rent", label: d.land.forRent },
            ].map((opt) => {
              const active = purpose === opt.value;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setParam({ purpose: opt.value || null })}
                  aria-pressed={active}
                  className={cn(
                    "flex-1 rounded-[var(--radius-sm)] px-2 py-1.5 text-[13px] font-medium transition-[background-color,color] duration-200",
                    active
                      ? "bg-[var(--palmyra-gold)] text-[var(--kani-green-deep)] shadow-[var(--shadow-md)]"
                      : "text-[var(--muted)] hover:bg-[var(--kani-green)]/8 hover:text-[var(--ink)]"
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </BarField>

        <BarField label={d.lands.district} htmlFor="f-district">
          <BarSelect
            id="f-district"
            value={districtSlug}
            onChange={(e) => setParam({ district: e.target.value, city: null })}
          >
            <option value="">{d.lands.allDistricts}</option>
            {districts.map((district) => (
              <option key={district._id} value={district.slug}>
                {localizedName(district, locale)}
              </option>
            ))}
          </BarSelect>
        </BarField>

        <BarField label={d.lands.landType} htmlFor="f-land-type">
          <BarSelect
            id="f-land-type"
            value={get("landType")}
            onChange={(e) => setParam({ landType: e.target.value })}
          >
            <option value="">{d.lands.allLandTypes}</option>
            {landTypes.map((type) => (
              <option key={type._id} value={type.slug}>
                {localizedName(type, locale)}
              </option>
            ))}
          </BarSelect>
        </BarField>

        {/* Full min/max on both size and price — matching the mobile sheet's
            field set exactly. Desktop used to offer only a size minimum and a
            price maximum, so the same visitor got two different result sets
            depending on which UI they were filtering from. */}
        <BarField label={d.lands.sizePerches}>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <BarSelect
              aria-label={d.lands.minSizeAria}
              value={get("minPerch")}
              onChange={(e) => setParam({ minPerch: e.target.value })}
            >
              <option value="">{d.lands.anySize}</option>
              {PERCH_STEPS.map((p) => (
                <option key={p} value={p}>{t(d.land.perchesValue, { n: p })}</option>
              ))}
            </BarSelect>
            <span className="text-[var(--muted)]" aria-hidden="true">–</span>
            <BarSelect
              aria-label={d.lands.maxSizeAria}
              value={get("maxPerch")}
              onChange={(e) => setParam({ maxPerch: e.target.value })}
            >
              <option value="">{d.lands.anySize}</option>
              {PERCH_STEPS.map((p) => (
                <option key={p} value={p}>{t(d.land.perchesValue, { n: p })}</option>
              ))}
            </BarSelect>
          </div>
        </BarField>

        <BarField label={d.lands.priceLKR}>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <BarSelect
              aria-label={d.lands.minPriceAria}
              value={get("minPrice")}
              onChange={(e) => setParam({ minPrice: e.target.value })}
            >
              <option value="">{d.lands.anyPrice}</option>
              {PRICE_STEPS.map((p) => (
                <option key={p} value={p}>{compactLKR(p)}</option>
              ))}
            </BarSelect>
            <span className="text-[var(--muted)]" aria-hidden="true">–</span>
            <BarSelect
              aria-label={d.lands.maxPriceAria}
              value={get("maxPrice")}
              onChange={(e) => setParam({ maxPrice: e.target.value })}
            >
              <option value="">{d.lands.anyPrice}</option>
              {PRICE_STEPS.map((p) => (
                <option key={p} value={p}>{compactLKR(p)}</option>
              ))}
            </BarSelect>
          </div>
        </BarField>

        <div className="border-t border-[var(--hairline)] pt-4">
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            aria-expanded={moreOpen}
            className="flex w-full cursor-pointer items-center justify-between text-[13.5px] font-medium
                       text-[var(--kani-green)] transition-colors duration-200 hover:text-[var(--kani-green-deep)]"
          >
            {d.lands.moreFilters}
            <svg
              viewBox="0 0 16 16"
              className={cn("size-3.5 transition-transform duration-200", moreOpen && "rotate-180")}
              fill="none"
              aria-hidden="true"
            >
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {moreOpen && <div className="mt-4">{moreControls}</div>}
        </div>
      </aside>

      {/* Mobile trigger — fixed at the bottom of the viewport rather than
          inline above the grid, so it stays reachable while scrolling through
          a long results list instead of requiring a trip back to the top. */}
      <div
        className="fixed inset-x-0 bottom-0 z-30 flex justify-center p-4 lg:hidden"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
      >
        <Button
          size="lg"
          className="shadow-[0_8px_28px_-6px_rgba(10,44,30,0.4)]"
          onClick={() => setMobileSheetOpen(true)}
        >
          <svg viewBox="0 0 16 16" className="size-4" fill="none" aria-hidden="true">
            <path d="M2 4h12M4 8h8M6.5 12h3" stroke="currentColor" strokeWidth="1.6"
                  strokeLinecap="round" />
          </svg>
          {d.lands.filters}
        </Button>
      </div>

      {/* Mobile: every field, since the bar above isn't shown at this width. */}
      <Sheet
        open={mobileSheetOpen}
        onClose={() => setMobileSheetOpen(false)}
        title={d.lands.filterLands}
        footer={
          <Button fullWidth size="lg" onClick={() => setMobileSheetOpen(false)}>
            {/* The live count makes the button an answer, not a guess. */}
            {resultCount === 1
              ? d.lands.showLandsOne
              : t(d.lands.showLands, { count: resultCount })}
          </Button>
        }
      >
        {allControlsForSheet}
      </Sheet>
    </>
  );
}

function compactLKR(n: number): string {
  if (n >= 1_000_000) return `${n / 1_000_000}M`;
  return `${n / 1_000}K`;
}
