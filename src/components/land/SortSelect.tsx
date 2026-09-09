"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SORT_OPTIONS } from "@/lib/search-params";
import { useI18n } from "@/lib/i18n/client";
import * as EnumLabel from "@/lib/i18n/enums";

/**
 * Sort control for the results toolbar. Split out of `FilterPanel` — sort used
 * to live only inside the desktop filter sidebar, which meant it was
 * unreachable on mobile (the sheet never included it). This renders in the
 * toolbar above the grid instead, at every breakpoint.
 */
export function SortSelect({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { d, locale } = useI18n();

  // Sort doesn't reset pagination the way a filter change does — it's a view
  // of the same result set, not a narrower query.
  const setSort = useCallback(
    (value: string) => {
      const sp = new URLSearchParams(params.toString());
      if (value === "newest") sp.delete("sort");
      else sp.set("sort", value);
      router.push(`${pathname}${sp.toString() ? `?${sp}` : ""}`, { scroll: false });
    },
    [params, pathname, router]
  );

  return (
    <label className={className}>
      <span className="sr-only">{d.lands.sortBy}</span>
      <select
        value={params.get("sort") || "newest"}
        onChange={(e) => setSort(e.target.value)}
        className="h-11 w-full cursor-pointer appearance-none rounded-[var(--radius-md)] border border-[var(--hairline)]
                   bg-[var(--card)] pl-3.5 pr-8 text-sm font-medium text-ink
                   bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22 fill=%22none%22><path d=%22M4 6l4 4 4-4%22 stroke=%22%23566a5f%22 stroke-width=%221.6%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/></svg>')] bg-[length:14px] bg-[right_10px_center] bg-no-repeat
                   transition-colors duration-200 hover:border-[var(--kani-green)]/40
                   focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kani-green)]"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {EnumLabel.SORT[locale][o.value]}
          </option>
        ))}
      </select>
    </label>
  );
}
