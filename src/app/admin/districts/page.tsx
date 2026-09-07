import type { Metadata } from "next";
import { dbConnect } from "@/lib/db";
import District from "@/models/District";
import { plain } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/Card";
import { TaxonomyManager } from "@/components/admin/TaxonomyManager";
import { getDictionary } from "@/lib/i18n";
import { adminLocale } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Districts", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminDistrictsPage() {
  const d = getDictionary(await adminLocale());
  await dbConnect();
  const districts = await District.find({}).sort({ order: 1, name: 1 }).lean();

  return (
    <div className="max-w-3xl">
      <SectionHeading title={d.admin.districts} subtitle={d.admin.districtsSub} />
      <TaxonomyManager kind="district" initialRows={plain(districts)} />
    </div>
  );
}
