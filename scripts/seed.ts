/**
 * Seed script. Idempotent: re-running replaces the kani_* collections without
 * touching anything else in the database.
 *
 *   npm run seed
 */
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { dbConnect } from "../src/lib/db";
import District from "../src/models/District";
import City from "../src/models/City";
import LandType from "../src/models/LandType";
import Land from "../src/models/Land";
import KaniImage from "../src/models/Image";
import AdminUser from "../src/models/AdminUser";
import SiteSettings from "../src/models/SiteSettings";
import PageModel from "../src/models/Page";
import { processImage, makeLqip } from "../src/lib/images";
import { slugify, buildLandSlug } from "../src/lib/slug";
import { formatSize, toPerches } from "../src/lib/units";
import { DISTRICTS, CITIES, LAND_TYPES, SAMPLE_LANDS } from "./seed-data";
import { renderScene } from "./scene";
import { PAGES } from "./seed-pages";

async function main() {
  await dbConnect();
  console.log("→ connected\n");

  // ── wipe only our own collections ────────────────────────────────────
  await Promise.all([
    District.deleteMany({}),
    City.deleteMany({}),
    LandType.deleteMany({}),
    Land.deleteMany({}),
    KaniImage.deleteMany({}),
    AdminUser.deleteMany({}),
    SiteSettings.deleteMany({}),
    PageModel.deleteMany({}),
  ]);
  console.log("→ cleared kani_* collections");

  // ── districts ────────────────────────────────────────────────────────
  const districts = await District.insertMany(
    DISTRICTS.map((d) => ({ ...d, isActive: true }))
  );
  const districtBySlug = new Map(districts.map((d) => [d.slug, d]));
  console.log(`→ ${districts.length} districts`);

  // ── cities ───────────────────────────────────────────────────────────
  const cityDocs = CITIES.flatMap(({ district, names }) => {
    const d = districtBySlug.get(district);
    if (!d) throw new Error(`Unknown district in seed: ${district}`);
    return names.map((name, i) => ({
      name,
      slug: slugify(name),
      district: d._id,
      order: i,
      isActive: true,
    }));
  });
  const cities = await City.insertMany(cityDocs);
  const cityByName = new Map(cities.map((c) => [c.name, c]));
  console.log(`→ ${cities.length} cities`);

  // ── land types ───────────────────────────────────────────────────────
  const landTypes = await LandType.insertMany(
    LAND_TYPES.map((t) => ({ ...t, isActive: true }))
  );
  const landTypeBySlug = new Map(landTypes.map((t) => [t.slug, t]));
  console.log(`→ ${landTypes.length} land types`);

  // ── superadmin ───────────────────────────────────────────────────────
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env.local");
  }
  const admin = await AdminUser.create({
    name: process.env.SEED_ADMIN_NAME || "Administrator",
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role: "superadmin",
    isActive: true,
  });
  console.log(`→ superadmin ${admin.email}`);

  // ── settings + pages ─────────────────────────────────────────────────
  await SiteSettings.create({ key: "main" });
  await PageModel.insertMany(PAGES);
  console.log(`→ settings + ${PAGES.length} content pages`);

  // ── listings, with photos through the real pipeline ──────────────────
  const perDistrictCount = new Map<string, number>();
  let created = 0;

  for (const [i, seed] of SAMPLE_LANDS.entries()) {
    const district = districtBySlug.get(seed.district)!;
    const city = cityByName.get(seed.city);
    const landType = landTypeBySlug.get(seed.landType)!;
    if (!city) throw new Error(`Unknown city in seed: ${seed.city}`);

    // KANI-VAV-0042 — sequential per district.
    const n = (perDistrictCount.get(district.code) ?? 0) + 1;
    perDistrictCount.set(district.code, n);
    const refCode = `KANI-${district.code}-${String(n).padStart(4, "0")}`;

    const sizeInPerches = toPerches(seed.sizeValue, seed.sizeUnit);
    const slug = buildLandSlug({
      sizeLabel: formatSize(seed.sizeValue, seed.sizeUnit),
      landType: landType.name,
      area: seed.area ?? city.name,
      district: district.name,
      refCode,
    });

    // Three photos each: the cover is watermarked, the rest are not.
    const raw = await Promise.all([
      renderScene(seed.scene, i),
      renderScene(seed.scene, i + 7),
      renderScene(seed.scene, i + 13),
    ]);

    const imageIds: mongoose.Types.ObjectId[] = [];
    for (const [k, buf] of raw.entries()) {
      const processed = await processImage(buf, {
        watermark: k === 0,
        filename: `${refCode}-${k + 1}.jpg`,
      });
      const doc = await KaniImage.create({
        data: processed.data,
        mimeType: processed.mimeType,
        bytes: processed.bytes,
        width: processed.width,
        height: processed.height,
        alt:
          k === 0
            ? `${seed.title} — view of the property`
            : `${seed.title} — photo ${k + 1}`,
        order: k,
      });
      imageIds.push(doc._id);
    }

    const coverThumb = await makeLqip(raw[0]);

    const land = await Land.create({
      refCode,
      title: seed.title,
      slug,
      purpose: seed.purpose,
      salePrice: seed.salePrice,
      rentAmount: seed.rentAmount,
      rentPeriod: "month",
      depositAmount: seed.depositAmount,
      priceNegotiable: seed.priceNegotiable ?? false,
      sizeValue: seed.sizeValue,
      sizeUnit: seed.sizeUnit,
      sizeInPerches,
      buildingSizeSqft: seed.buildingSizeSqft,
      district: district._id,
      city: city._id,
      area: seed.area,
      nearestTown: seed.nearestTown,
      distanceFromTownKm: seed.distanceFromTownKm,
      landType: landType._id,
      deedType: seed.deedType,
      accessRoadWidthFt: seed.accessRoadWidthFt,
      frontageFt: seed.frontageFt,
      waterSource: seed.waterSource ?? "none",
      utilities: {
        electricity: seed.utilities?.electricity ?? false,
        waterLine: seed.utilities?.waterLine ?? false,
        well: seed.utilities?.well ?? false,
        telecom: seed.utilities?.telecom ?? false,
      },
      bedrooms: seed.bedrooms,
      bathrooms: seed.bathrooms,
      features: seed.features ?? [],
      description: seed.description,
      imageIds,
      coverImageId: imageIds[0],
      coverThumb,
      imageCount: imageIds.length,
      ownerName: seed.ownerName,
      contactNumbers: seed.contactNumbers,
      whatsappNumber: seed.whatsappNumber,
      status: seed.status ?? "available",
      showWhenSold: true,
      isPublished: true,
      isFeatured: seed.isFeatured ?? false,
      isPopular: seed.isPopular ?? false,
      popularRank: seed.popularRank,
      viewCount: Math.floor(Math.random() * 260) + 20,
      createdBy: admin._id,
    });

    // Backfill the ownership link on each image.
    await KaniImage.updateMany({ _id: { $in: imageIds } }, { $set: { landId: land._id } });

    created += 1;
    process.stdout.write(`\r→ ${created}/${SAMPLE_LANDS.length} listings  `);
  }

  console.log(`\n→ ${created} listings with ${created * 3} photos\n`);

  // Report actual storage, so the 512MB ceiling is a known number not a surprise.
  const stats = await KaniImage.aggregate([
    { $group: { _id: null, total: { $sum: "$bytes" }, n: { $sum: 1 } } },
  ]);
  if (stats[0]) {
    const mb = stats[0].total / 1024 / 1024;
    console.log(
      `   image payload: ${mb.toFixed(1)}MB binary across ${stats[0].n} photos ` +
        `(~${(mb * 1.33).toFixed(1)}MB stored as base64)`
    );
  }

  console.log(`\n✓ Seed complete.\n  Admin login: ${email}\n`);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error("\n✗ Seed failed:", err);
  await mongoose.disconnect();
  process.exit(1);
});
