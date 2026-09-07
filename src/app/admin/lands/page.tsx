import type { Metadata } from "next";
import { dbConnect } from "@/lib/db";
import Land from "@/models/Land";
import District from "@/models/District";
import { plain } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { LandsTable } from "@/components/admin/LandsTable";
import { getDictionary, interpolate } from "@/lib/i18n";
import { adminLocale } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Listings", robots: { index: false } };
export const dynamic = "force-dynamic";

const ROW_PROJECTION =
  "refCode title purpose salePrice rentAmount sizeValue sizeUnit status " +
  "isPublished isFeatured isPopular coverImageId district createdAt";

export default async function AdminLandsPage() {
  const d = getDictionary(await adminLocale());
  await dbConnect();
  const [rows, districts] = await Promise.all([
    Land.find({})
      .select(ROW_PROJECTION)
      .populate({ path: "district", select: "name" })
      .sort({ createdAt: -1 })
      .lean(),
    District.find({}).sort({ order: 1, name: 1 }).select("name").lean(),
  ]);

  return (
    <div>
      <SectionHeading
        title={d.admin.listings}
        subtitle={interpolate(d.admin.totalCount, { count: rows.length })}
        action={
          <ButtonLink href="/admin/lands/new">{d.admin.newListing}</ButtonLink>
        }
      />
      <LandsTable initialRows={plain(rows)} districts={plain(districts)} />
    </div>
  );
}
