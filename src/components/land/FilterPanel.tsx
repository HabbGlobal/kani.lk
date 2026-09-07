"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Checkbox } from "@/components/ui/Field";
import { DEED_TYPE_LABELS } from "@/models/types";
import { SORT_OPTIONS } from "@/lib/search-params";
import { cn } from "@/lib/utils";

type Taxonomy = { _id: string; name: string; slug: string }[];

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

  // Sort doesn't reset pagination the way a filter change does — it's a
  // view of the same result set, not a narrower query.
  const setSort = useCallback(
    (value: string) => {
      const sp = new URLSearchParams(params.toString());
      if (value === "newest") sp.delete("sort");
      else sp.set("sort", value);
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
      <Field label="Keyword" htmlFor="f-q" hint="Title, area or reference code">
        <Input
          id="f-q"
          type="search"
          name="q"
          defaultValue={get("q")}
          placeholder="Omanthai, corner block, KANI-VAV-0001"
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
        <Field label="City or town" htmlFor="f-city">
          <Select
            id="f-city"
            value={get("city")}
            onChange={(e) => setParam({ city: e.target.value })}
          >
            <option value="">Anywhere in the district</option>
            {visibleCities.map((c) => (
              <option key={c._id} value={c.slug}>{c.name}</option>
            ))}
          </Select>
        </Field>
      )}

      <Field label="Deed type" htmlFor="f-deed">
        <Select
          id="f-deed"
          value={get("deedType")}
          onChange={(e) => setParam({ deedType: e.target.value })}
        >
          <option value="">Any deed type</option>
          {Object.entries(DEED_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </Select>
      </Field>

      <Field label="Access road" htmlFor="f-road">
        <Select
          id="f-road"
          value={get("minRoadFt")}
          onChange={(e) => setParam({ minRoadFt: e.target.value })}
        >
          <option value="">Any road width</option>
          {[10, 12, 15, 20, 30].map((ft) => (
            <option key={ft} value={ft}>{ft}ft or wider</option>
          ))}
        </Select>
      </Field>

      <fieldset className="space-y-1">
        <legend className="mb-1 text-[14px] font-medium text-[var(--ink)]">
          Utilities
        </legend>
        <Checkbox
          label="Electricity at the boundary"
          checked={get("electricity") === "1"}
          onChange={(e) => setParam({ electricity: e.target.checked ? "1" : null })}
        />
        <Checkbox
          label="Water — well, tank or NWSDB line"
          checked={get("water") === "1"}
          onChange={(e) => setParam({ water: e.target.checked ? "1" : null })}
        />
      </fieldset>

      <div className="border-t border-[var(--hairline)] pt-4">
        <Checkbox
          label="Include sold and rented listings"
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
      <Field label="Purpose" htmlFor="f-purpose-sheet">
        <Select
          id="f-purpose-sheet"
          value={purpose}
          onChange={(e) => setParam({ purpose: e.target.value })}
        >
          <option value="">For sale or rent</option>
          <option value="sale">For sale</option>
          <option value="rent">For rent</option>
        </Select>
      </Field>

      <Field label="District" htmlFor="f-district-sheet">
        <Select
          id="f-district-sheet"
          value={districtSlug}
          onChange={(e) => setParam({ district: e.target.value, city: null })}
        >
          <option value="">All districts</option>
          {districts.map((d) => (
            <option key={d._id} value={d.slug}>{d.name}</option>
          ))}
        </Select>
      </Field>

      <Field label="Land type" htmlFor="f-type-sheet">
        <Select
          id="f-type-sheet"
          value={get("landType")}
          onChange={(e) => setParam({ landType: e.target.value })}
        >
          <option value="">All land types</option>
          {landTypes.map((t) => (
            <option key={t._id} value={t.slug}>{t.name}</option>
          ))}
        </Select>
      </Field>

      <Field label="Size (perches)">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <Select
            aria-label="Minimum size in perches"
            value={get("minPerch")}
            onChange={(e) => setParam({ minPerch: e.target.value })}
          >
            <option value="">No min</option>
            {PERCH_STEPS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </Select>
          <span className="text-[var(--muted)]" aria-hidden="true">–</span>
          <Select
            aria-label="Maximum size in perches"
            value={get("maxPerch")}
            onChange={(e) => setParam({ maxPerch: e.target.value })}
          >
            <option value="">No max</option>
            {PERCH_STEPS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </Select>
        </div>
      </Field>

      <Field label="Price (LKR)">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <Select
            aria-label="Minimum price"
            value={get("minPrice")}
            onChange={(e) => setParam({ minPrice: e.target.value })}
          >
            <option value="">No min</option>
            {PRICE_STEPS.map((p) => (
              <option key={p} value={p}>{compactLKR(p)}</option>
            ))}
          </Select>
          <span className="text-[var(--muted)]" aria-hidden="true">–</span>
          <Select
            aria-label="Maximum price"
            value={get("maxPrice")}
            onChange={(e) => setParam({ maxPrice: e.target.value })}
          >
            <option value="">No max</option>
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
          "sticky top-24 hidden flex-col gap-5 rounded-[var(--radius-lg)] border border-[var(--hairline)] bg-[var(--card)] p-5 shadow-[var(--shadow-md)] lg:flex",
          pending && "opacity-60 transition-opacity duration-200"
        )}
        role="search"
        aria-label="Filter listings"
      >
        <BarField label="Sort by" htmlFor="f-sort">
          <select
            id="f-sort"
            value={get("sort") || "newest"}
            onChange={(e) => setSort(e.target.value)}
            className="h-10 w-full cursor-pointer appearance-none rounded-[var(--radius-md)] border border-[var(--hairline)]
                       bg-[var(--bone)] pl-3.5 pr-8 text-[13.5px] font-medium text-[var(--ink)]
                       bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22 fill=%22none%22><path d=%22M4 6l4 4 4-4%22 stroke=%22%23566a5f%22 stroke-width=%221.6%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/></svg>')] bg-[length:14px] bg-[right_10px_center] bg-no-repeat
                       transition-colors duration-200 hover:border-[var(--kani-green)]/40
                       focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kani-green)]"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </BarField>

        <div className="border-t border-[var(--hairline)]" />

        <BarField label="Purpose">
          <div className="flex items-center gap-0.5 rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--bone)] p-1">
            {[
              { value: "", label: "All" },
              { value: "sale", label: "For sale" },
              { value: "rent", label: "For rent" },
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

        <BarField label="District" htmlFor="f-district">
          <BarSelect
            id="f-district"
            value={districtSlug}
            onChange={(e) => setParam({ district: e.target.value, city: null })}
          >
            <option value="">All districts</option>
            {districts.map((d) => (
              <option key={d._id} value={d.slug}>{d.name}</option>
            ))}
          </BarSelect>
        </BarField>

        <BarField label="Land type" htmlFor="f-land-type">
          <BarSelect
            id="f-land-type"
            value={get("landType")}
            onChange={(e) => setParam({ landType: e.target.value })}
          >
            <option value="">All land types</option>
            {landTypes.map((t) => (
              <option key={t._id} value={t.slug}>{t.name}</option>
            ))}
          </BarSelect>
        </BarField>

        <BarField label="Minimum size" htmlFor="f-min-perch">
          <BarSelect
            id="f-min-perch"
            value={get("minPerch")}
            onChange={(e) => setParam({ minPerch: e.target.value })}
          >
            <option value="">Any size</option>
            {PERCH_STEPS.map((p) => (
              <option key={p} value={p}>{p}+ perches</option>
            ))}
          </BarSelect>
        </BarField>

        <BarField label="Maximum price" htmlFor="f-max-price">
          <BarSelect
            id="f-max-price"
            value={get("maxPrice")}
            onChange={(e) => setParam({ maxPrice: e.target.value })}
          >
            <option value="">Any price</option>
            {PRICE_STEPS.map((p) => (
              <option key={p} value={p}>Up to {compactLKR(p)}</option>
            ))}
          </BarSelect>
        </BarField>

        <div className="border-t border-[var(--hairline)] pt-4">
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            aria-expanded={moreOpen}
            className="flex w-full cursor-pointer items-center justify-between text-[13.5px] font-medium
                       text-[var(--kani-green)] transition-colors duration-200 hover:text-[var(--kani-green-deep)]"
          >
            More filters
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

      {/* Mobile trigger */}
      <Button
        variant="outline"
        size="sm"
        className="lg:hidden"
        onClick={() => setMobileSheetOpen(true)}
      >
        <svg viewBox="0 0 16 16" className="size-4" fill="none" aria-hidden="true">
          <path d="M2 4h12M4 8h8M6.5 12h3" stroke="currentColor" strokeWidth="1.6"
                strokeLinecap="round" />
        </svg>
        Filters
      </Button>

      {/* Mobile: every field, since the bar above isn't shown at this width. */}
      <Sheet
        open={mobileSheetOpen}
        onClose={() => setMobileSheetOpen(false)}
        title="Filter lands"
        footer={
          <Button fullWidth size="lg" onClick={() => setMobileSheetOpen(false)}>
            {/* The live count makes the button an answer, not a guess. */}
            Show {resultCount} {resultCount === 1 ? "land" : "lands"}
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
