import mongoose, { Schema, model, models, type Model, type InferSchemaType } from "mongoose";
import {
  PURPOSES,
  SIZE_UNITS,
  DEED_TYPES,
  LAND_STATUSES,
  RENT_PERIODS,
  WATER_SOURCES,
} from "./types";
import { toPerches, pricePerPerch } from "@/lib/units";

const LandSchema = new Schema(
  {
    refCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    purpose: { type: String, enum: PURPOSES, required: true, default: "sale" },

    // ── pricing ────────────────────────────────────────────────────────────
    salePrice: { type: Number, min: 0 },
    rentAmount: { type: Number, min: 0 },
    rentPeriod: { type: String, enum: RENT_PERIODS, default: "month" },
    depositAmount: { type: Number, min: 0 },
    priceNegotiable: { type: Boolean, default: false },
    /** "Price on request" — hides figures on the public site. */
    priceOnRequest: { type: Boolean, default: false },
    /** Derived on save. Never entered by hand. */
    pricePerPerch: { type: Number },

    // ── size ───────────────────────────────────────────────────────────────
    sizeValue: { type: Number, required: true, min: 0 },
    sizeUnit: { type: String, enum: SIZE_UNITS, required: true, default: "perch" },
    /** Derived. Used for ALL filtering and sorting. */
    sizeInPerches: { type: Number, required: true, min: 0, index: true },
    buildingSizeSqft: { type: Number, min: 0 },

    // ── location ───────────────────────────────────────────────────────────
    district: { type: Schema.Types.ObjectId, ref: "KaniDistrict", required: true, index: true },
    city: { type: Schema.Types.ObjectId, ref: "KaniCity", required: true, index: true },
    area: { type: String, trim: true },
    addressLine: { type: String, trim: true },
    nearestTown: { type: String, trim: true },
    distanceFromTownKm: { type: Number, min: 0 },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    googleMapsUrl: { type: String, trim: true },

    // ── land specifics ─────────────────────────────────────────────────────
    landType: { type: Schema.Types.ObjectId, ref: "KaniLandType", required: true, index: true },
    deedType: { type: String, enum: DEED_TYPES },
    accessRoadWidthFt: { type: Number, min: 0 },
    frontageFt: { type: Number, min: 0 },
    waterSource: { type: String, enum: WATER_SOURCES, default: "none" },
    utilities: {
      electricity: { type: Boolean, default: false },
      waterLine: { type: Boolean, default: false },
      well: { type: Boolean, default: false },
      telecom: { type: Boolean, default: false },
    },
    bedrooms: { type: Number, min: 0 },
    bathrooms: { type: Number, min: 0 },
    features: { type: [String], default: [] },

    // ── content ────────────────────────────────────────────────────────────
    description: { type: String, required: true },
    descriptionTa: { type: String },

    // ── images: references only, never the base64 payload ──────────────────
    imageIds: { type: [Schema.Types.ObjectId], ref: "KaniImage", default: [] },
    coverImageId: { type: Schema.Types.ObjectId, ref: "KaniImage" },
    /** ~20x15 base64 LQIP, under 1KB. The one place base64 travels inline. */
    coverThumb: { type: String, default: "" },
    imageCount: { type: Number, default: 0 },

    // ── contact ────────────────────────────────────────────────────────────
    ownerName: { type: String, required: true, trim: true },
    contactNumbers: {
      type: [String],
      default: [],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: "At least one contact number is required",
      },
    },
    whatsappNumber: { type: String, trim: true },

    // ── state (all admin controlled) ───────────────────────────────────────
    status: { type: String, enum: LAND_STATUSES, default: "available", index: true },
    soldAt: { type: Date },
    /** Keeps the listing in the homepage "recently sold" row after sale. */
    showWhenSold: { type: Boolean, default: true },
    isPublished: { type: Boolean, default: false, index: true },
    isFeatured: { type: Boolean, default: false },
    isPopular: { type: Boolean, default: false },
    popularRank: { type: Number },
    viewCount: { type: Number, default: 0 },
    inquiryCount: { type: Number, default: 0 },
    publishedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "KaniAdminUser" },
  },
  { timestamps: true, collection: "kani_lands" }
);

// ── Indexes from the brief ───────────────────────────────────────────────
LandSchema.index({ isPublished: 1, district: 1, purpose: 1, sizeInPerches: 1 });
LandSchema.index({ isPublished: 1, isPopular: 1, popularRank: 1 });
LandSchema.index({ isPublished: 1, status: 1, soldAt: -1 });
LandSchema.index({ isPublished: 1, createdAt: -1 });
LandSchema.index(
  { title: "text", area: "text", description: "text" },
  { weights: { title: 10, area: 5, description: 1 }, name: "land_text_search" }
);

/** Derive everything derivable, so callers can never get it wrong. */
LandSchema.pre("save", function () {
  this.sizeInPerches = toPerches(this.sizeValue, this.sizeUnit);

  this.pricePerPerch =
    this.salePrice && this.sizeInPerches
      ? pricePerPerch(this.salePrice, this.sizeInPerches)
      : undefined;

  // soldAt is stamped the moment status moves into a terminal state,
  // and cleared if the listing comes back to market.
  const isGone = this.status === "sold" || this.status === "rented";
  if (isGone && !this.soldAt) this.soldAt = new Date();
  if (!isGone && this.soldAt) this.soldAt = undefined;

  if (this.isPublished && !this.publishedAt) this.publishedAt = new Date();

  this.imageCount = this.imageIds?.length ?? 0;
  if (!this.coverImageId && this.imageIds?.length) {
    this.coverImageId = this.imageIds[0];
  }

});

export type LandDoc = InferSchemaType<typeof LandSchema> & { _id: mongoose.Types.ObjectId };

export const Land: Model<LandDoc> =
  (models.KaniLand as Model<LandDoc>) ?? model<LandDoc>("KaniLand", LandSchema);

export default Land;

/**
 * Fields needed to render a land card. Explicit projection keeps list queries
 * lean — and proves at a glance that no payload can leak into a list response.
 */
export const LAND_CARD_PROJECTION = {
  refCode: 1, title: 1, slug: 1, purpose: 1,
  salePrice: 1, rentAmount: 1, rentPeriod: 1, depositAmount: 1,
  priceNegotiable: 1, priceOnRequest: 1, pricePerPerch: 1,
  sizeValue: 1, sizeUnit: 1, sizeInPerches: 1,
  district: 1, city: 1, area: 1, nearestTown: 1, distanceFromTownKm: 1,
  landType: 1, deedType: 1, accessRoadWidthFt: 1,
  coverImageId: 1, coverThumb: 1, imageCount: 1,
  status: 1, isFeatured: 1, isPopular: 1, popularRank: 1,
  soldAt: 1, publishedAt: 1, createdAt: 1,
} as const;
