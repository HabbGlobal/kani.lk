import type { SizeUnit } from "@/models/types";

/**
 * Sri Lankan land units. 1 acre = 160 perches, 1 rood = 40 perches,
 * 1 perch = 272.25 sq ft.
 */
export const PERCHES_PER_ACRE = 160;
export const PERCHES_PER_ROOD = 40;
export const SQFT_PER_PERCH = 272.25;

export function toPerches(value: number, unit: SizeUnit): number {
  switch (unit) {
    case "perch":
      return value;
    case "acre":
      return value * PERCHES_PER_ACRE;
    case "rood":
      return value * PERCHES_PER_ROOD;
    case "sqft":
      return value / SQFT_PER_PERCH;
    default:
      return value;
  }
}

export function fromPerches(perches: number, unit: SizeUnit): number {
  switch (unit) {
    case "perch":
      return perches;
    case "acre":
      return perches / PERCHES_PER_ACRE;
    case "rood":
      return perches / PERCHES_PER_ROOD;
    case "sqft":
      return perches * SQFT_PER_PERCH;
    default:
      return perches;
  }
}

/** Trim trailing zeros: 20.00 -> "20", 2.50 -> "2.5" */
function trimNumber(n: number, maxDp = 2): string {
  return Number(n.toFixed(maxDp)).toLocaleString("en-LK", {
    maximumFractionDigits: maxDp,
  });
}

const UNIT_LABEL: Record<SizeUnit, [string, string]> = {
  perch: ["perch", "perches"],
  acre: ["acre", "acres"],
  rood: ["rood", "roods"],
  sqft: ["sq ft", "sq ft"],
};

/**
 * Tamil has no singular/plural split for these units, so one label each.
 * Kept here rather than in the dictionaries because it belongs with the
 * English table it mirrors.
 */
const UNIT_LABEL_TA: Record<SizeUnit, string> = {
  perch: "பரப்பு",
  acre: "ஏக்கர்",
  rood: "ரூட்",
  sqft: "சதுர அடி",
};

/**
 * "20 perches", "1 acre", "2.5 acres" — display in the unit the admin entered.
 * `locale` defaults to English so existing callers (admin, emails, exports)
 * keep their current output without change.
 */
export function formatSize(value: number, unit: SizeUnit, locale: "en" | "ta" = "en"): string {
  if (locale === "ta") {
    return `${trimNumber(value)} ${UNIT_LABEL_TA[unit]}`;
  }
  const [singular, plural] = UNIT_LABEL[unit];
  const label = Math.abs(value - 1) < 1e-9 ? singular : plural;
  return `${trimNumber(value)} ${label}`;
}

/** Money in LKR, no decimals — prices here are always whole rupees. */
export function formatLKR(amount: number): string {
  return `LKR ${Math.round(amount).toLocaleString("en-LK")}`;
}

/** Compact form for dense cards: LKR 1.6M / LKR 850K */
export function formatLKRCompact(amount: number): string {
  if (amount >= 1_000_000) {
    return `LKR ${Number((amount / 1_000_000).toFixed(2))}M`;
  }
  if (amount >= 1_000) {
    return `LKR ${Number((amount / 1_000).toFixed(0))}K`;
  }
  return formatLKR(amount);
}

export function pricePerPerch(salePrice: number, sizeInPerches: number): number | undefined {
  if (!salePrice || !sizeInPerches || sizeInPerches <= 0) return undefined;
  return Math.round(salePrice / sizeInPerches);
}
