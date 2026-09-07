"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { DEED_TYPE_LABELS } from "@/models/types";

type Named = { name: string; slug: string }[];

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

  const label = (list: Named, slug: string) =>
    list.find((x) => x.slug === slug)?.name ?? slug;

  const chips: { key: string; label: string }[] = [];
  const add = (key: string, text: string) => chips.push({ key, label: text });

  const v = (k: string) => params.get(k);

  if (v("q")) add("q", `“${v("q")}”`);
  if (v("purpose")) add("purpose", v("purpose") === "sale" ? "For sale" : "For rent");
  if (v("district")) add("district", label(districts, v("district")!));
  if (v("city")) add("city", label(cities, v("city")!));
  if (v("landType")) add("landType", label(landTypes, v("landType")!));
  if (v("minPerch")) add("minPerch", `From ${v("minPerch")} perches`);
  if (v("maxPerch")) add("maxPerch", `Up to ${v("maxPerch")} perches`);
  if (v("minPrice")) add("minPrice", `From LKR ${Number(v("minPrice")).toLocaleString("en-LK")}`);
  if (v("maxPrice")) add("maxPrice", `Up to LKR ${Number(v("maxPrice")).toLocaleString("en-LK")}`);
  if (v("deedType")) {
    const d = v("deedType") as keyof typeof DEED_TYPE_LABELS;
    add("deedType", DEED_TYPE_LABELS[d] ?? d);
  }
  if (v("minRoadFt")) add("minRoadFt", `${v("minRoadFt")}ft+ road`);
  if (v("electricity")) add("electricity", "Electricity");
  if (v("water")) add("water", "Water source");
  if (v("includeSold")) add("includeSold", "Including sold");

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
          className="group inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-[var(--radius-pill)]
                     bg-[var(--kani-green)]/10 pl-3 pr-2 text-[14px] font-medium text-[var(--kani-green)]
                     transition-colors duration-200 hover:bg-[var(--kani-green)]/18"
        >
          {chip.label}
          <span className="sr-only">— remove this filter</span>
          <svg viewBox="0 0 16 16" className="size-3.5 opacity-60 transition-opacity group-hover:opacity-100"
               fill="none" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8"
                  strokeLinecap="round" />
          </svg>
        </button>
      ))}

      <button
        type="button"
        onClick={clearAll}
        className="h-9 cursor-pointer rounded-[var(--radius-pill)] px-3 text-[14px] font-medium
                   text-[var(--laterite)] underline-offset-2 transition-colors hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}
