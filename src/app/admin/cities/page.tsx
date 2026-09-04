import type { Metadata } from "next";
import { dbConnect } from "@/lib/db";
import City from "@/models/City";
import District from "@/models/District";
import { plain } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/Card";
import { TaxonomyManager } from "@/components/admin/TaxonomyManager";

export const metadata: Metadata = { title: "Cities & towns", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminCitiesPage() {
  await dbConnect();
  const [cities, districts] = await Promise.all([
    City.find({}).sort({ order: 1, name: 1 }).populate({ path: "district", select: "name" }).lean(),
    District.find({}).sort({ order: 1, name: 1 }).select("name").lean(),
  ]);

  return (
    <div className="max-w-3xl">
      <SectionHeading
        title="Cities & towns"
        subtitle="Each city belongs to one district and narrows the location filter on the public site."
      />
      <TaxonomyManager kind="city" initialRows={plain(cities)} districts={plain(districts)} />
    </div>
  );
}
