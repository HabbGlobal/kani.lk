import type { Locale } from "./config";
import type { DeedType, LandStatus, Purpose, WaterSource, RentPeriod } from "@/models/types";

/**
 * Localized labels for the schema enums. `models/types.ts` keeps the English
 * maps — those are still the right thing for emails, CSV exports and anywhere
 * a value has to be stable regardless of who is looking. These are for display.
 *
 * Deliberately not merged into the page dictionaries: they are keyed by the
 * enum value, so a new deed type is a type error here and nowhere else.
 */

type EnumLabels<T extends string> = Record<Locale, Record<T, string>>;

export const DEED_TYPE: EnumLabels<DeedType> = {
  en: {
    freehold: "Freehold deed",
    ldo_permit: "LDO permit",
    grant: "Swarnabhoomi / Jayabhoomi grant",
    other: "Clear title pending",
  },
  ta: {
    freehold: "உறுதிப் பத்திரம்",
    ldo_permit: "LDO அனுமதிப் பத்திரம்",
    grant: "சுவர்ணபூமி / ஜயபூமி மானியம்",
    other: "உறுதி நிலுவையில்",
  },
};

export const STATUS: EnumLabels<LandStatus> = {
  en: {
    available: "Available",
    reserved: "Reserved",
    sold: "Sold",
    rented: "Rented",
  },
  ta: {
    available: "கிடைக்கிறது",
    reserved: "ஒதுக்கப்பட்டது",
    sold: "விற்கப்பட்டது",
    rented: "வாடகைக்கு விடப்பட்டது",
  },
};

export const WATER_SOURCE: EnumLabels<WaterSource> = {
  en: {
    none: "No water source",
    well: "Well",
    agri_well: "Agricultural well",
    tank: "Near tank / kulam",
    nwsdb: "NWSDB water line",
  },
  ta: {
    none: "நீர் ஆதாரம் இல்லை",
    well: "கிணறு",
    agri_well: "விவசாயக் கிணறு",
    tank: "குளத்திற்கு அருகில்",
    nwsdb: "NWSDB நீர்க் குழாய்",
  },
};

export const PURPOSE: EnumLabels<Purpose> = {
  en: {
    sale: "For sale",
    rent: "For rent",
    both: "Sale or rent",
  },
  ta: {
    sale: "விற்பனைக்கு",
    rent: "வாடகைக்கு",
    both: "விற்பனைக்கு அல்லது வாடகைக்கு",
  },
};

/** Rendered after a rent figure, as in "Rs 25,000/month". */
export const RENT_PERIOD: EnumLabels<RentPeriod> = {
  en: { month: "month", year: "year" },
  ta: { month: "மாதம்", year: "வருடம்" },
};

/**
 * Sort options. Keyed by the `sort` query value, so `SORT_OPTIONS` in
 * `search-params.ts` stays the single source of truth for which sorts exist
 * and their order — this only supplies the label to show for each.
 */
export const SORT: EnumLabels<
  "newest" | "price_asc" | "price_desc" | "perch_asc" | "size_asc" | "size_desc"
> = {
  en: {
    newest: "Newest first",
    price_asc: "Price: low to high",
    price_desc: "Price: high to low",
    perch_asc: "Price per perch: low to high",
    size_asc: "Size: small to large",
    size_desc: "Size: large to small",
  },
  ta: {
    newest: "புதியவை முதலில்",
    price_asc: "விலை: குறைவிலிருந்து அதிகம்",
    price_desc: "விலை: அதிகத்திலிருந்து குறைவு",
    perch_asc: "ஒரு பரப்பின் விலை: குறைவிலிருந்து அதிகம்",
    size_asc: "பரப்பளவு: சிறியதிலிருந்து பெரியது",
    size_desc: "பரப்பளவு: பெரியதிலிருந்து சிறியது",
  },
};

/** Size units, for `formatSize` output rendered in Tamil. */
export const SIZE_UNIT: EnumLabels<"perch" | "acre" | "rood" | "sqft"> = {
  en: { perch: "perches", acre: "acres", rood: "roods", sqft: "sq ft" },
  ta: { perch: "பரப்பு", acre: "ஏக்கர்", rood: "ரூட்", sqft: "சதுர அடி" },
};
