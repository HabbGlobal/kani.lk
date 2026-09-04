import type { Metadata } from "next";
import { LandEditor } from "@/components/admin/LandEditor";
import { getAdminTaxonomies } from "@/lib/admin-queries";
import type { LandFormValues } from "@/lib/validation";

export const metadata: Metadata = { title: "New listing", robots: { index: false } };
export const dynamic = "force-dynamic";

/**
 * refCode and slug do not exist yet — they are generated server-side on
 * first save (see POST /api/admin/lands), so this form starts identity-less
 * and LandEditor's live preview shows placeholder values until then.
 */
const EMPTY: LandFormValues = {
  title: "",
  purpose: "sale",
  sizeValue: "" as unknown as number,
  sizeUnit: "perch",
  district: "",
  city: "",
  landType: "",
  description: "",
  ownerName: "",
  contactNumbers: [""],
  features: [],
  imageIds: [],
};

export default async function NewLandPage() {
  const taxonomies = await getAdminTaxonomies();

  return (
    <div className="max-w-6xl">
      <LandEditor
        mode="create"
        taxonomies={taxonomies}
        initial={EMPTY}
        images={[]}
        title="New listing"
        subtitle="The reference code and URL are generated automatically when you save."
      />
    </div>
  );
}
