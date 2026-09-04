import type { Metadata } from "next";
import { dbConnect } from "@/lib/db";
import LandType from "@/models/LandType";
import { plain } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/Card";
import { TaxonomyManager } from "@/components/admin/TaxonomyManager";

export const metadata: Metadata = { title: "Land types", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminLandTypesPage() {
  await dbConnect();
  const landTypes = await LandType.find({}).sort({ order: 1, name: 1 }).lean();

  return (
    <div className="max-w-3xl">
      <SectionHeading
        title="Land types"
        subtitle="Bare land, paddy, coconut estate, house — 'has a building' controls extra fields in the listing editor."
      />
      <TaxonomyManager kind="land-type" initialRows={plain(landTypes)} />
    </div>
  );
}
