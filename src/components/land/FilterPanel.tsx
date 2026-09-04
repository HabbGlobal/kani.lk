"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Checkbox } from "@/components/ui/Field";
import { DEED_TYPE_LABELS } from "@/models/types";
import { cn } from "@/lib/utils";

type Taxonomy = { _id: string; name: string; slug: string }[];

const PERCH_STEPS = [5, 10, 15, 20, 40, 80, 160, 320, 800];
const PRICE_STEPS = [
  500_000, 1_000_000, 2_000_000, 3_000_000, 5_000_000,
  10_000_000, 20_000_000, 50_000_000,
];

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
  const [sheetOpen, setSheetOpen] = useState(false);
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
  const visibleCities = useMemo(() => {
    if (!districtSlug) return [];
    const d = districts.find((x) => x.slug === districtSlug);
    return d ? cities.filter((c) => c.district === d._id) : [];
  }, [districtSlug, districts, cities]);

  const controls = (
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

      <Field label="Purpose" htmlFor="f-purpose">
        <Select
          id="f-purpose"
          value={get("purpose")}
          onChange={(e) => setParam({ purpose: e.target.value })}
        >
          <option value="">For sale or rent</option>
          <option value="sale">For sale</option>
          <option value="rent">For rent</option>
        </Select>
      </Field>

      <Field label="District" htmlFor="f-district">
        <Select
          id="f-district"
          value={districtSlug}
          // Changing district invalidates the city, so clear it in the same push.
          onChange={(e) => setParam({ district: e.target.value, city: null })}
        >
          <option value="">All districts</option>
          {districts.map((d) => (
            <option key={d._id} value={d.slug}>{d.name}</option>
          ))}
        </Select>
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

      <Field label="Land type" htmlFor="f-type">
        <Select
          id="f-type"
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

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:block",
          pending && "opacity-60 transition-opacity duration-200"
        )}
        aria-label="Filters"
      >
        <div className="sticky top-28 rounded-[var(--radius-lg)] border border-[var(--hairline)] bg-[var(--card)] p-5">
          <h2 className="mb-5 font-serif text-[21px] text-[var(--kani-green)]">
            Filter
          </h2>
          {controls}
        </div>
      </aside>

      {/* Mobile trigger */}
      <Button
        variant="outline"
        size="sm"
        className="lg:hidden"
        onClick={() => setSheetOpen(true)}
      >
        <svg viewBox="0 0 16 16" className="size-4" fill="none" aria-hidden="true">
          <path d="M2 4h12M4 8h8M6.5 12h3" stroke="currentColor" strokeWidth="1.6"
                strokeLinecap="round" />
        </svg>
        Filters
      </Button>

      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filter lands"
        footer={
          <Button fullWidth size="lg" onClick={() => setSheetOpen(false)}>
            {/* The live count makes the button an answer, not a guess. */}
            Show {resultCount} {resultCount === 1 ? "land" : "lands"}
          </Button>
        }
      >
        {controls}
      </Sheet>
    </>
  );
}

function compactLKR(n: number): string {
  if (n >= 1_000_000) return `${n / 1_000_000}M`;
  return `${n / 1_000}K`;
}
