import { z } from "zod";
import { PURPOSES, SIZE_UNITS, DEED_TYPES, LAND_STATUSES, WATER_SOURCES } from "@/models/types";

/**
 * One schema per form, imported by both the client component and the API route.
 * Validation can never drift between the two.
 */

/**
 * Exactly two accepted shapes, no spaces or extra punctuation either way:
 *  - a plain 10-digit local number starting with 0, e.g. 0771234567
 *  - the full international format, e.g. +94775556667
 */
const PHONE_PATTERN = /^(0\d{9}|\+94\d{9})$/;
const phone = z
  .string()
  .trim()
  .min(1, "Please enter a phone number")
  .regex(PHONE_PATTERN, "Enter a 10-digit number (0771234567) or +94775556667");

export const inquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120),
  phone,
  email: z
    .union([z.string().trim().email("Enter a valid email address"), z.literal("")])
    .optional(),
  message: z
    .string()
    .trim()
    .min(10, "Please write at least a sentence")
    .max(2000, "That message is too long"),
  landId: z.string().optional(),
  source: z.enum(["listing", "contact"]).default("listing"),
  /** Honeypot — must stay empty. */
  website: z.string().max(0).optional(),
});

export type InquiryInput = z.output<typeof inquirySchema>;
/** Input side of the schema — what the form holds before defaults are applied. */
export type InquiryFormValues = z.input<typeof inquirySchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/** Optional number coming from a form field that may be an empty string. */
const optionalNumber = z.preprocess(
  (v) => (v === "" || v == null ? undefined : Number(v)),
  z.number().min(0, "This can't be negative").optional()
);

export const landSchema = z
  .object({
    title: z.string().trim().min(6, "Give the listing a descriptive title").max(200),
    purpose: z.enum(PURPOSES),

    salePrice: optionalNumber,
    rentAmount: optionalNumber,
    rentPeriod: z.enum(["month", "year"]).default("month"),
    depositAmount: optionalNumber,
    priceNegotiable: z.boolean().default(false),
    priceOnRequest: z.boolean().default(false),

    sizeValue: z.preprocess(
      (v) => (v === "" || v == null ? undefined : Number(v)),
      z.number().positive("Enter the size")
    ),
    sizeUnit: z.enum(SIZE_UNITS),
    buildingSizeSqft: optionalNumber,

    district: z.string().min(1, "Choose a district"),
    city: z.string().min(1, "Choose a city or town"),
    area: z.string().trim().max(120).optional(),
    addressLine: z.string().trim().max(240).optional(),
    nearestTown: z.string().trim().max(120).optional(),
    distanceFromTownKm: optionalNumber,
    googleMapsUrl: z.union([z.string().trim().url(), z.literal("")]).optional(),

    landType: z.string().min(1, "Choose a land type"),
    deedType: z.union([z.enum(DEED_TYPES), z.literal("")]).optional(),
    accessRoadWidthFt: optionalNumber,
    frontageFt: optionalNumber,
    waterSource: z.enum(WATER_SOURCES).default("none"),
    utilities: z
      .object({
        electricity: z.boolean().default(false),
        waterLine: z.boolean().default(false),
        well: z.boolean().default(false),
        telecom: z.boolean().default(false),
      })
      .default({ electricity: false, waterLine: false, well: false, telecom: false }),
    bedrooms: optionalNumber,
    bathrooms: optionalNumber,
    features: z.array(z.string().trim().min(1)).default([]),

    description: z
      .string()
      .trim()
      .min(40, "Write at least a short paragraph — buyers skip thin listings")
      .max(6000),
    descriptionTa: z.string().trim().max(6000).optional(),

    ownerName: z.string().trim().min(2, "Enter the owner's name").max(120),
    contactNumbers: z
      .array(phone)
      .min(1, "At least one contact number is required")
      .max(4),
    whatsappNumber: z.union([phone, z.literal("")]).optional(),

    status: z.enum(LAND_STATUSES).default("available"),
    showWhenSold: z.boolean().default(true),
    isPublished: z.boolean().default(false),
    isFeatured: z.boolean().default(false),
    isPopular: z.boolean().default(false),
    popularRank: optionalNumber,

    imageIds: z.array(z.string()).default([]),
    coverImageId: z.string().optional(),
  })
  // A sale listing without a sale price is not a listing.
  .refine(
    (d) => d.priceOnRequest || d.purpose === "rent" || (d.salePrice ?? 0) > 0,
    { message: "Enter a sale price, or tick 'price on request'", path: ["salePrice"] }
  )
  .refine(
    (d) => d.priceOnRequest || d.purpose === "sale" || (d.rentAmount ?? 0) > 0,
    { message: "Enter a rent amount, or tick 'price on request'", path: ["rentAmount"] }
  );

export type LandInput = z.output<typeof landSchema>;
/** Input side — what react-hook-form actually holds before Zod defaults apply. */
export type LandFormValues = z.input<typeof landSchema>;

export const districtSchema = z.object({
  name: z.string().trim().min(2, "Enter a district name").max(80),
  nameTa: z.string().trim().max(80).optional(),
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(2, "Enter a 2–4 letter code")
    .max(4, "Codes are at most 4 letters")
    .regex(/^[A-Z]+$/, "Letters only"),
  province: z.string().trim().max(60).optional(),
  intro: z.string().trim().max(4000).optional(),
  introTa: z.string().trim().max(4000).optional(),
  order: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const citySchema = z.object({
  name: z.string().trim().min(2, "Enter a city or town name").max(80),
  nameTa: z.string().trim().max(80).optional(),
  district: z.string().min(1, "Choose a district"),
  order: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const landTypeSchema = z.object({
  name: z.string().trim().min(2, "Enter a land type name").max(80),
  nameTa: z.string().trim().max(80).optional(),
  description: z.string().trim().max(600).optional(),
  hasBuilding: z.boolean().default(false),
  order: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const pageSchema = z.object({
  title: z.string().trim().min(2).max(160),
  titleTa: z.string().trim().max(160).optional(),
  body: z.string().trim().max(40000),
  bodyTa: z.string().trim().max(40000).optional(),
  seoTitle: z.string().trim().max(200).optional(),
  seoDescription: z.string().trim().max(400).optional(),
});

export type PageInput = z.infer<typeof pageSchema>;

export const settingsSchema = z.object({
  heroTitle: z.string().trim().max(200),
  heroSubtitle: z.string().trim().max(600),
  contactPhone: z.string().trim().max(40),
  contactPhoneAlt: z.string().trim().max(40).optional(),
  contactEmail: z.union([z.string().trim().email(), z.literal("")]),
  contactWhatsapp: z.string().trim().max(40).optional(),
  officeAddress: z.string().trim().max(240).optional(),
  officeHours: z.string().trim().max(160).optional(),
  facebookUrl: z.union([z.string().trim().url(), z.literal("")]).optional(),
  instagramUrl: z.union([z.string().trim().url(), z.literal("")]).optional(),
  tiktokUrl: z.union([z.string().trim().url(), z.literal("")]).optional(),
  youtubeUrl: z.union([z.string().trim().url(), z.literal("")]).optional(),
  seoTitle: z.string().trim().max(200),
  seoDescription: z.string().trim().max(400),
  popularMode: z.enum(["manual", "automatic"]).default("manual"),
  popularSectionTitle: z.string().trim().max(120),
  showSoldRow: z.boolean().default(true),
});

export type SettingsInput = z.output<typeof settingsSchema>;
export type SettingsFormValues = z.input<typeof settingsSchema>;

export const adminUserSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  role: z.enum(["superadmin", "editor"]).default("editor"),
  isActive: z.boolean().default(true),
  password: z
    .union([z.string().min(8, "Use at least 8 characters"), z.literal("")])
    .optional(),
});

export type AdminUserInput = z.output<typeof adminUserSchema>;
export type AdminUserFormValues = z.input<typeof adminUserSchema>;
