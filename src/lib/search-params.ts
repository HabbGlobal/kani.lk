import type { LandFilters } from "./queries";
import type { Purpose, DeedType } from "@/models/types";

/**
 * Search state lives entirely in the URL, so results are shareable and the
 * browser back button behaves. This module is the single translator between
 * query strings and the filter object.
 */
export type RawParams = Record<string, string | string[] | undefined>;

function one(v: string | string[] | undefined): string | undefined {
  const s = Array.isArray(v) ? v[0] : v;
  return s && s.trim() ? s.trim() : undefined;
}

function num(v: string | string[] | undefined): number | undefined {
  const s = one(v);
  if (s == null) return undefined;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "perch_asc", label: "Price per perch: low to high" },
  { value: "size_asc", label: "Size: small to large" },
  { value: "size_desc", label: "Size: large to small" },
] as const;

const PURPOSES = new Set(["sale", "rent", "both"]);
const DEEDS = new Set(["freehold", "ldo_permit", "grant", "other"]);

export function parseFilters(params: RawParams): LandFilters {
  const purpose = one(params.purpose);
  const deedType = one(params.deedType);

  return {
    q: one(params.q),
    district: one(params.district),
    city: one(params.city),
    landType: one(params.landType),
    purpose: purpose && PURPOSES.has(purpose) ? (purpose as Purpose) : undefined,
    minPrice: num(params.minPrice),
    maxPrice: num(params.maxPrice),
    minPerch: num(params.minPerch),
    maxPerch: num(params.maxPerch),
    deedType: deedType && DEEDS.has(deedType) ? (deedType as DeedType) : undefined,
    minRoadFt: num(params.minRoadFt),
    electricity: one(params.electricity) === "1",
    water: one(params.water) === "1",
    includeSold: one(params.includeSold) === "1",
    sort: one(params.sort) ?? "newest",
    page: num(params.page) ?? 1,
  };
}

/** Rebuild a query string, dropping empties and resetting the page. */
export function buildQuery(
  filters: Partial<LandFilters>,
  overrides: Partial<LandFilters> = {}
): string {
  const merged = { ...filters, ...overrides };
  const sp = new URLSearchParams();

  const put = (key: string, value: unknown) => {
    if (value == null || value === "" || value === false) return;
    if (key === "sort" && value === "newest") return;
    if (key === "page" && value === 1) return;
    sp.set(key, value === true ? "1" : String(value));
  };

  put("q", merged.q);
  put("district", merged.district);
  put("city", merged.city);
  put("landType", merged.landType);
  put("purpose", merged.purpose);
  put("minPrice", merged.minPrice);
  put("maxPrice", merged.maxPrice);
  put("minPerch", merged.minPerch);
  put("maxPerch", merged.maxPerch);
  put("deedType", merged.deedType);
  put("minRoadFt", merged.minRoadFt);
  put("electricity", merged.electricity);
  put("water", merged.water);
  put("includeSold", merged.includeSold);
  put("sort", merged.sort);
  put("page", merged.page);

  const s = sp.toString();
  return s ? `?${s}` : "";
}

/** Count filters the user actively set — drives the mobile "Filters (3)" badge. */
export function activeFilterCount(f: LandFilters): number {
  const keys: (keyof LandFilters)[] = [
    "q", "district", "city", "landType", "purpose",
    "minPrice", "maxPrice", "minPerch", "maxPerch",
    "deedType", "minRoadFt", "electricity", "water", "includeSold",
  ];
  return keys.filter((k) => {
    const v = f[k];
    return v != null && v !== "" && v !== false;
  }).length;
}
