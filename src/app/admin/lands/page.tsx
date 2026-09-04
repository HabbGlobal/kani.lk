import type { Metadata } from "next";
import { dbConnect } from "@/lib/db";
import Land from "@/models/Land";
import District from "@/models/District";
import { plain } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { LandsTable } from "@/components/admin/LandsTable";

export const metadata: Metadata = { title: "Listings", robots: { index: false } };
export const dynamic = "force-dynamic";

const ROW_PROJECTION =
  "refCode title purpose salePrice rentAmount sizeValue sizeUnit status " +
  "isPublished isFeatured isPopular coverImageId district createdAt";

export default async function AdminLandsPage() {
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
        title="Listings"
        subtitle={`${rows.length} total`}
        action={<ButtonLink href="/admin/lands/new">New listing</ButtonLink>}
      />
      <LandsTable initialRows={plain(rows)} districts={plain(districts)} />
    </div>
  );
}
