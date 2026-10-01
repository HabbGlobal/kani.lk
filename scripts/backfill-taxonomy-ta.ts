/**
 * One-off backfill: populates nameTa (and introTa on District) on existing
 * District, City and LandType documents, and titleTa/bodyTa on existing Page
 * documents (about/terms/privacy), from the Tamil copy already written in
 * seed-data.ts / seed-pages.ts.
 * Admin screens (taxonomy lists, the listing editor's district/city/land-type
 * dropdowns) and the public site read these via localizedName() / localizedPage()
 * — a site whose documents were created before the Ta fields were added (or
 * never re-saved through the admin form) falls back to English even though
 * Tamil copy is available in seed data.
 *
 * Districts and land types match by slug; cities have no slug in seed data
 * (seed.ts derives it via slugify(name)), so they match by name within their
 * district; pages match by slug. Only fills currently-empty Ta fields, so it
 * never overwrites Tamil copy an admin has already edited in the dashboard.
 *
 * Usage: npx tsx --env-file=.env.local scripts/backfill-taxonomy-ta.ts
 */
import "dotenv/config";
import { dbConnect } from "../src/lib/db";
import District from "../src/models/District";
import City from "../src/models/City";
import LandType from "../src/models/LandType";
import PageModel from "../src/models/Page";
import { DISTRICTS, CITIES, LAND_TYPES } from "./seed-data";
import { PAGES } from "./seed-pages";

// Mongoose's Model<T> generic makes a shared helper across two different
// document types more trouble than it's worth for a one-off script — each
// model keeps its own small loop instead.

async function backfillDistricts() {
  let updated = 0;
  for (const item of DISTRICTS) {
    // .lean() returns the raw stored document rather than applying schema
    // defaults, so an unset nameTa/introTa reads as unset rather than "".
    const doc = await District.findOne({ slug: item.slug }).lean();
    if (!doc) continue;
    const updates: Record<string, string> = {};
    if (!doc.nameTa?.trim()) updates.nameTa = item.nameTa;
    if (!doc.introTa?.trim() && item.introTa) updates.introTa = item.introTa;
    if (Object.keys(updates).length === 0) continue;
    await District.updateOne({ _id: doc._id }, { $set: updates });
    updated++;
  }
  console.log(`Districts: backfilled ${updated} of ${DISTRICTS.length}`);
}

async function backfillLandTypes() {
  let updated = 0;
  for (const item of LAND_TYPES) {
    const doc = await LandType.findOne({ slug: item.slug }).lean();
    if (!doc || doc.nameTa?.trim()) continue;
    await LandType.updateOne({ _id: doc._id }, { $set: { nameTa: item.nameTa } });
    updated++;
  }
  console.log(`Land types: backfilled ${updated} of ${LAND_TYPES.length}`);
}

async function backfillCities() {
  let updated = 0;
  let total = 0;
  for (const { district, names, namesTa } of CITIES) {
    const districtDoc = await District.findOne({ slug: district }).lean();
    if (!districtDoc) continue;
    for (let i = 0; i < names.length; i++) {
      total++;
      const doc = await City.findOne({ name: names[i], district: districtDoc._id }).lean();
      if (!doc || doc.nameTa?.trim()) continue;
      await City.updateOne({ _id: doc._id }, { $set: { nameTa: namesTa[i] } });
      updated++;
    }
  }
  console.log(`Cities: backfilled ${updated} of ${total}`);
}

async function backfillPages() {
  let updated = 0;
  for (const item of PAGES) {
    const doc = await PageModel.findOne({ slug: item.slug }).lean();
    if (!doc) continue;
    const updates: Record<string, string> = {};
    if (!doc.titleTa?.trim() && item.titleTa) updates.titleTa = item.titleTa;
    if (!doc.bodyTa?.trim() && item.bodyTa) updates.bodyTa = item.bodyTa;
    if (Object.keys(updates).length === 0) continue;
    await PageModel.updateOne({ _id: doc._id }, { $set: updates });
    updated++;
  }
  console.log(`Pages: backfilled ${updated} of ${PAGES.length}`);
}

async function main() {
  await dbConnect();
  await backfillDistricts();
  await backfillCities();
  await backfillLandTypes();
  await backfillPages();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
