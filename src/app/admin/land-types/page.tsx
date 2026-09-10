import type { Metadata } from "next";
import { dbConnect } from "@/lib/db";
import LandType from "@/models/LandType";
import { plain } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/Card";
import { TaxonomyManager } from "@/components/admin/TaxonomyManager";
import { getDictionary } from "@/lib/i18n";
import { adminLocale } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Land types", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminLandTypesPage() {
  const d = getDictionary(await adminLocale());
  await dbConnect();
  const landTypes = await LandType.find({}).sort({ order: 1, name: 1 }).lean();

  return (
    <div className="max-w-3xl">
      <SectionHeading title={d.admin.landTypes} subtitle={d.admin.landTypesSub} />
      <TaxonomyManager kind="land-type" initialRows={plain(landTypes)} />
    </div>
  );
}
