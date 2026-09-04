import type { Metadata } from "next";
import { dbConnect } from "@/lib/db";
import Inquiry from "@/models/Inquiry";
import Land from "@/models/Land";
import { plain } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/Card";
import { InquiriesInbox } from "@/components/admin/InquiriesInbox";

export const metadata: Metadata = { title: "Enquiries", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  await dbConnect();
  const [rows, landOptions] = await Promise.all([
    Inquiry.find({}).sort({ createdAt: -1 }).limit(500).lean(),
    Land.find({}).sort({ createdAt: -1 }).select("title refCode").lean(),
  ]);

  return (
    <div className="max-w-3xl">
      <SectionHeading title="Enquiries" subtitle="Every message sent through a listing or the contact page." />
      <InquiriesInbox initialRows={plain(rows)} landOptions={plain(landOptions)} />
    </div>
  );
}
