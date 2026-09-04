import type { Metadata } from "next";
import { dbConnect } from "@/lib/db";
import District from "@/models/District";
import { plain } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/Card";
import { TaxonomyManager } from "@/components/admin/TaxonomyManager";

export const metadata: Metadata = { title: "Districts", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminDistrictsPage() {
  await dbConnect();
  const districts = await District.find({}).sort({ order: 1, name: 1 }).lean();

  return (
    <div className="max-w-3xl">
      <SectionHeading
        title="Districts"
        subtitle="The admin-managed list every listing, filter and district page draws from."
      />
      <TaxonomyManager kind="district" initialRows={plain(districts)} />
    </div>
  );
}
