import "server-only";
import mongoose from "mongoose";
import type { PipelineStage } from "mongoose";

/**
 * Mongoose 9 no longer exports FilterQuery publicly, and its strict inferred
 * filter type rejects perfectly valid $or/$and shapes. A permissive local alias
 * keeps the query builder readable without fighting the inference.
 */
type Filter = Record<string, unknown> & {
  $or?: Record<string, unknown>[];
  $and?: Record<string, unknown>[];
};
import { dbConnect } from "./db";
import Land, { LAND_CARD_PROJECTION } from "@/models/Land";
import District from "@/models/District";
import City from "@/models/City";
import LandType from "@/models/LandType";
import SiteSettings from "@/models/SiteSettings";
import KaniImage, { IMAGE_META_PROJECTION } from "@/models/Image";
import { plain } from "./utils";
import type { LandStatus, Purpose, DeedType } from "@/models/types";

/** A listing as it appears on a card — no image payload, ever. */
export type LandCard = {
  _id: string;
  refCode: string;
  title: string;
  slug: string;
  purpose: Purpose;
  salePrice?: number;
  rentAmount?: number;
  rentPeriod?: "month" | "year";
  depositAmount?: number;
  priceNegotiable: boolean;
  priceOnRequest: boolean;
  pricePerPerch?: number;
  sizeValue: number;
  sizeUnit: "perch" | "acre" | "rood" | "sqft";
  sizeInPerches: number;
  area?: string;
  nearestTown?: string;
  distanceFromTownKm?: number;
  deedType?: DeedType;
  accessRoadWidthFt?: number;
  coverImageId?: string;
  coverThumb?: string;
  imageCount: number;
  status: LandStatus;
  district: { _id: string; name: string; nameTa?: string; slug: string };
  city: { _id: string; name: string; nameTa?: string; slug: string };
  landType: { _id: string; name: string; nameTa?: string; slug: string };
  soldAt?: string;
  createdAt: string;
};

const CARD_POPULATE = [
  { path: "district", select: "name nameTa slug code" },
  { path: "city", select: "name nameTa slug" },
  { path: "landType", select: "name nameTa slug hasBuilding" },
];

export type LandFilters = {
  q?: string;
  district?: string;
  city?: string;
  landType?: string;
  purpose?: Purpose;
  minPrice?: number;
  maxPrice?: number;
  minPerch?: number;
  maxPerch?: number;
  deedType?: DeedType;
  minRoadFt?: number;
  electricity?: boolean;
  water?: boolean;
  includeSold?: boolean;
  sort?: string;
  page?: number;
  perPage?: number;
};

/**
 * Build the Mongo filter. Slugs come in from the URL and are resolved to ids
 * here — nothing in the app references a district by literal string.
 */
async function buildFilter(f: LandFilters): Promise<Filter> {
  const filter: Filter = { isPublished: true };

  // Sold and rented are excluded by default; "Include sold" brings them back.
  if (!f.includeSold) {
    filter.status = { $in: ["available", "reserved"] as LandStatus[] };
  }

  if (f.district) {
    const d = await District.findOne({ slug: f.district }).select("_id").lean();
    // An unknown slug must match nothing, not everything.
    filter.district = d?._id ?? new mongoose.Types.ObjectId();
  }
  if (f.city) {
    const c = await City.findOne({ slug: f.city }).select("_id").lean();
    filter.city = c?._id ?? new mongoose.Types.ObjectId();
  }
  if (f.landType) {
    const t = await LandType.findOne({ slug: f.landType }).select("_id").lean();
    filter.landType = t?._id ?? new mongoose.Types.ObjectId();
  }

  // A "both" listing is genuinely available for either, so it matches both filters.
  if (f.purpose === "sale") filter.purpose = { $in: ["sale", "both"] };
  else if (f.purpose === "rent") filter.purpose = { $in: ["rent", "both"] };
  else if (f.purpose === "both") filter.purpose = "both";

  if (f.minPerch != null || f.maxPerch != null) {
    const size: Record<string, number> = {};
    if (f.minPerch != null) size.$gte = f.minPerch;
    if (f.maxPerch != null) size.$lte = f.maxPerch;
    filter.sizeInPerches = size;
  }

  // Price range applies to whichever price the listing actually carries.
  if (f.minPrice != null || f.maxPrice != null) {
    const range: Record<string, number> = {};
    if (f.minPrice != null) range.$gte = f.minPrice;
    if (f.maxPrice != null) range.$lte = f.maxPrice;
    filter.$or = [{ salePrice: range }, { rentAmount: range }];
  }

  if (f.deedType) filter.deedType = f.deedType;
  if (f.minRoadFt != null) filter.accessRoadWidthFt = { $gte: f.minRoadFt };
  if (f.electricity) filter["utilities.electricity"] = true;
  if (f.water) {
    filter.$and = [
      ...(filter.$and ?? []),
      {
        $or: [
          { "utilities.waterLine": true },
          { "utilities.well": true },
          { waterSource: { $in: ["well", "agri_well", "tank", "nwsdb"] } },
        ],
      },
    ];
  }

  if (f.q?.trim()) {
    const rx = new RegExp(
      f.q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i"
    );
    filter.$and = [
      ...(filter.$and ?? []),
      { $or: [{ title: rx }, { area: rx }, { description: rx }, { refCode: rx }] },
    ];
  }

  return filter;
}

const SORTS: Record<string, Record<string, 1 | -1>> = {
  newest: { publishedAt: -1, createdAt: -1 },
  price_asc: { salePrice: 1 },
  price_desc: { salePrice: -1 },
  perch_asc: { pricePerPerch: 1 },
  size_asc: { sizeInPerches: 1 },
  size_desc: { sizeInPerches: -1 },
};

/** Server-side filtering and pagination. Never fetch all and filter client-side. */
export async function searchLands(f: LandFilters) {
  await dbConnect();

  const page = Math.max(1, f.page ?? 1);
  const perPage = Math.min(48, f.perPage ?? 12);
  const filter = await buildFilter(f);
  const sort = SORTS[f.sort ?? "newest"] ?? SORTS.newest;

  const [docs, total] = await Promise.all([
    Land.find(filter)
      .select(LAND_CARD_PROJECTION)
      .populate(CARD_POPULATE)
      .sort(sort)
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean(),
    Land.countDocuments(filter),
  ]);

  return {
    items: plain<LandCard[]>(docs),
    total,
    page,
    perPage,
    pages: Math.max(1, Math.ceil(total / perPage)),
  };
}

/** Count only — used to price the "Show 34 lands" button without fetching rows. */
export async function countLands(f: LandFilters): Promise<number> {
  await dbConnect();
  return Land.countDocuments(await buildFilter(f));
}

export async function getLandBySlug(slug: string) {
  await dbConnect();
  const doc = await Land.findOne({ slug, isPublished: true })
    .populate(CARD_POPULATE)
    .lean();
  if (!doc) return null;
  return plain<LandCard & Record<string, unknown>>(doc);
}

/** Gallery metadata only — the payload stays in the images collection. */
export async function getLandImages(landId: string) {
  await dbConnect();
  const docs = await KaniImage.find({ landId })
    .select(IMAGE_META_PROJECTION)
    .sort({ order: 1 })
    .lean();
  return plain<
    { _id: string; alt: string; width: number; height: number; order: number }[]
  >(docs);
}

const AVAILABLE: Filter = {
  isPublished: true,
  status: { $in: ["available", "reserved"] },
};

/**
 * Popular row. Manual ranking is the default and always wins when on;
 * automatic orders by views over the last 30 days.
 */
export async function getPopularLands(limit = 8) {
  await dbConnect();
  const settings = await SiteSettings.findOne({ key: "main" }).lean();

  if (settings?.popularMode === "automatic") {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const docs = await Land.find({
      ...AVAILABLE,
      $or: [{ publishedAt: { $gte: since } }, { viewCount: { $gt: 0 } }],
    })
      .select(LAND_CARD_PROJECTION)
      .populate(CARD_POPULATE)
      .sort({ viewCount: -1, publishedAt: -1 })
      .limit(limit)
      .lean();
    return plain<LandCard[]>(docs);
  }

  const docs = await Land.find({ ...AVAILABLE, isPopular: true })
    .select(LAND_CARD_PROJECTION)
    .populate(CARD_POPULATE)
    .sort({ popularRank: 1, publishedAt: -1 })
    .limit(limit)
    .lean();
  return plain<LandCard[]>(docs);
}

export async function getFeaturedLands(limit = 6) {
  await dbConnect();
  const docs = await Land.find({ ...AVAILABLE, isFeatured: true })
    .select(LAND_CARD_PROJECTION)
    .populate(CARD_POPULATE)
    .sort({ publishedAt: -1 })
    .limit(limit)
    .lean();
  return plain<LandCard[]>(docs);
}

export async function getLatestLands(limit = 8) {
  await dbConnect();
  const docs = await Land.find(AVAILABLE)
    .select(LAND_CARD_PROJECTION)
    .populate(CARD_POPULATE)
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(limit)
    .lean();
  return plain<LandCard[]>(docs);
}

/**
 * The homepage "Recently sold and rented" row. Kept strictly out of the popular
 * and latest rows — a sold card there reads as a broken site; here, labelled,
 * the same cards are the strongest trust signal on the page.
 */
export async function getRecentlySold(limit = 6) {
  await dbConnect();
  const docs = await Land.find({
    isPublished: true,
    status: { $in: ["sold", "rented"] as LandStatus[] },
    showWhenSold: true,
  })
    .select(LAND_CARD_PROJECTION)
    .populate(CARD_POPULATE)
    .sort({ soldAt: -1 })
    .limit(limit)
    .lean();
  return plain<LandCard[]>(docs);
}

/** Turns the dead end of a sold listing into a lead. */
export async function getSimilarLands(
  land: { _id: string; district: { _id: string } | string },
  limit = 4
) {
  await dbConnect();
  const districtId =
    typeof land.district === "string" ? land.district : land.district._id;
  const docs = await Land.find({
    ...AVAILABLE,
    district: districtId,
    _id: { $ne: land._id },
  })
    .select(LAND_CARD_PROJECTION)
    .populate(CARD_POPULATE)
    .sort({ publishedAt: -1 })
    .limit(limit)
    .lean();
  return plain<LandCard[]>(docs);
}

export type DistrictSummary = {
  _id: string;
  name: string;
  nameTa?: string;
  slug: string;
  code: string;
  province: string;
  intro: string;
  introTa?: string;
  count: number;
};

/** Districts with live listing counts, for the browse-by-district grid. */
export async function getDistrictsWithCounts(): Promise<DistrictSummary[]> {
  await dbConnect();
  const pipeline: PipelineStage[] = [
    { $match: { isActive: true } },
    { $sort: { order: 1 } },
    {
      $lookup: {
        from: "kani_lands",
        let: { districtId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$district", "$$districtId"] },
              isPublished: true,
              status: { $in: ["available", "reserved"] },
            },
          },
          { $count: "n" },
        ],
        as: "landCount",
      },
    },
    {
      $project: {
        name: 1, nameTa: 1, slug: 1, code: 1, province: 1, intro: 1, introTa: 1,
        count: { $ifNull: [{ $arrayElemAt: ["$landCount.n", 0] }, 0] },
      },
    },
  ];
  const rows = await District.aggregate(pipeline);
  return plain<DistrictSummary[]>(rows);
}

export async function getDistrictBySlug(slug: string) {
  await dbConnect();
  const doc = await District.findOne({ slug, isActive: true }).lean();
  return doc ? plain<DistrictSummary>(doc) : null;
}

export async function getTaxonomies() {
  await dbConnect();
  const [districts, cities, landTypes] = await Promise.all([
    District.find({ isActive: true }).sort({ order: 1 }).select("name nameTa slug code").lean(),
    City.find({ isActive: true }).sort({ order: 1 }).select("name nameTa slug district").lean(),
    LandType.find({ isActive: true }).sort({ order: 1 }).select("name nameTa slug hasBuilding").lean(),
  ]);
  return {
    districts: plain<{ _id: string; name: string; nameTa?: string; slug: string; code: string }[]>(districts),
    cities: plain<{ _id: string; name: string; nameTa?: string; slug: string; district: string }[]>(cities),
    landTypes: plain<{ _id: string; name: string; nameTa?: string; slug: string; hasBuilding: boolean }[]>(landTypes),
  };
}

export async function getSettings() {
  await dbConnect();
  const doc =
    (await SiteSettings.findOne({ key: "main" }).lean()) ??
    (await SiteSettings.create({ key: "main" })).toObject();
  return plain<Record<string, string | boolean>>(doc);
}

export async function getPage(slug: string) {
  await dbConnect();
  const { default: PageModel } = await import("@/models/Page");
  const doc = await PageModel.findOne({ slug }).lean();
  return doc
    ? plain<{
        title: string;
        titleTa?: string;
        body: string;
        bodyTa?: string;
        seoTitle?: string;
        seoDescription?: string;
      }>(doc)
    : null;
}
