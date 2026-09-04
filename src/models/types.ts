import type { Types } from "mongoose";

export const PURPOSES = ["sale", "rent", "both"] as const;
export type Purpose = (typeof PURPOSES)[number];

export const SIZE_UNITS = ["perch", "acre", "rood", "sqft"] as const;
export type SizeUnit = (typeof SIZE_UNITS)[number];

export const DEED_TYPES = ["freehold", "ldo_permit", "grant", "other"] as const;
export type DeedType = (typeof DEED_TYPES)[number];

export const LAND_STATUSES = ["available", "reserved", "sold", "rented"] as const;
export type LandStatus = (typeof LAND_STATUSES)[number];

export const RENT_PERIODS = ["month", "year"] as const;
export type RentPeriod = (typeof RENT_PERIODS)[number];

export const ADMIN_ROLES = ["superadmin", "editor"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const WATER_SOURCES = ["none", "well", "agri_well", "tank", "nwsdb"] as const;
export type WaterSource = (typeof WATER_SOURCES)[number];

/** Human labels — single source of truth for display across the app. */
export const DEED_TYPE_LABELS: Record<DeedType, string> = {
  freehold: "Freehold deed",
  ldo_permit: "LDO permit",
  grant: "Swarnabhoomi / Jayabhoomi grant",
  other: "Clear title pending",
};

export const STATUS_LABELS: Record<LandStatus, string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
  rented: "Rented",
};

export const WATER_SOURCE_LABELS: Record<WaterSource, string> = {
  none: "No water source",
  well: "Well",
  agri_well: "Agricultural well",
  tank: "Near tank / kulam",
  nwsdb: "NWSDB water line",
};

export const PURPOSE_LABELS: Record<Purpose, string> = {
  sale: "For sale",
  rent: "For rent",
  both: "Sale or rent",
};

export type Ref = Types.ObjectId;
