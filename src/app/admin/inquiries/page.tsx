import type { Metadata } from "next";
import { dbConnect } from "@/lib/db";
import Inquiry from "@/models/Inquiry";
import Land from "@/models/Land";
import { plain } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/Card";
import { InquiriesInbox } from "@/components/admin/InquiriesInbox";
import { getDictionary } from "@/lib/i18n";
import { adminLocale } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Enquiries", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  const d = getDictionary(await adminLocale());
  await dbConnect();
  const [rows, landOptions] = await Promise.all([
    Inquiry.find({}).sort({ createdAt: -1 }).limit(500).lean(),
    Land.find({}).sort({ createdAt: -1 }).select("title refCode").lean(),
  ]);

  return (
    <div className="max-w-3xl">
      <SectionHeading title={d.admin.enquiries} subtitle={d.admin.inquiriesSub} />
      <InquiriesInbox initialRows={plain(rows)} landOptions={plain(landOptions)} />
    </div>
  );
}
