"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/client";
import { localizedName } from "@/lib/i18n/localized";
import * as EnumLabel from "@/lib/i18n/enums";
import type { DeedType } from "@/models/types";

type Named = { name: string; nameTa?: string; slug: string }[];

/** Active filters as removable chips, plus a "Clear all". */
export function FilterChips({
  districts,
  cities,
  landTypes,
}: {
  districts: Named;
  cities: Named;
  landTypes: Named;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { d, t, locale } = useI18n();

  const label = (list: Named, slug: string) => {
    const found = list.find((x) => x.slug === slug);
    return found ? localizedName(found, locale) : slug;
  };

  const chips: { key: string; label: string }[] = [];
  const add = (key: string, text: string) => chips.push({ key, label: text });

  const v = (k: string) => params.get(k);

  if (v("q")) add("q", `“${v("q")}”`);
  if (v("purpose"))
    add("purpose", v("purpose") === "sale" ? d.land.forSale : d.land.forRent);
  if (v("district")) add("district", label(districts, v("district")!));
  if (v("city")) add("city", label(cities, v("city")!));
  if (v("landType")) add("landType", label(landTypes, v("landType")!));
  if (v("minPerch"))
    add("minPerch", t(d.lands.chipFromPerches, { n: v("minPerch")! }));
  if (v("maxPerch"))
    add("maxPerch", t(d.lands.chipUpToPerches, { n: v("maxPerch")! }));
  if (v("minPrice"))
    add(
      "minPrice",
      t(d.lands.chipFrom, {
        value: `LKR ${Number(v("minPrice")).toLocaleString("en-LK")}`,
      })
    );
  if (v("maxPrice"))
    add(
      "maxPrice",
      t(d.lands.chipUpTo, {
        value: `LKR ${Number(v("maxPrice")).toLocaleString("en-LK")}`,
      })
    );
  if (v("deedType")) {
    const deed = v("deedType") as DeedType;
    add("deedType", EnumLabel.DEED_TYPE[locale][deed] ?? deed);
  }
  if (v("minRoadFt"))
    add("minRoadFt", t(d.lands.chipRoad, { ft: v("minRoadFt")! }));
  if (v("electricity")) add("electricity", d.land.electricity);
  if (v("water")) add("water", d.lands.chipWaterSource);
  if (v("includeSold")) add("includeSold", d.lands.chipIncludingSold);

  const remove = (key: string) => {
    const sp = new URLSearchParams(params.toString());
    sp.delete(key);
    if (key === "district") sp.delete("city");
    sp.delete("page");
    router.push(`${pathname}${sp.toString() ? `?${sp}` : ""}`, { scroll: false });
  };

  const clearAll = () => router.push(pathname, { scroll: false });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => remove(chip.key)}
          className="group inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-[var(--radius-pill)]
                     bg-[var(--kani-green)]/10 pl-3.5 pr-2.5 text-sm font-medium text-[var(--kani-green)]
                     transition-colors duration-200 hover:bg-[var(--kani-green)]/18"
        >
          {chip.label}
          {/* A visible-sized hit area around the ✕, not just the glyph itself —
              the icon alone was ~14px, well under a usable touch target. */}
          <span className="grid size-6 place-items-center rounded-full opacity-70 transition-opacity group-hover:opacity-100">
            <span className="sr-only">{d.lands.removeFilter}</span>
            <svg viewBox="0 0 16 16" className="size-3.5" fill="none" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8"
                    strokeLinecap="round" />
            </svg>
          </span>
        </button>
      ))}

      <button
        type="button"
        onClick={clearAll}
        className="grid h-11 cursor-pointer place-items-center rounded-[var(--radius-pill)] px-3.5 text-sm font-medium
                   text-[var(--laterite)] underline-offset-2 transition-colors hover:underline"
      >
        {d.common.clearAll}
      </button>
    </div>
  );
}
