import type { Metadata } from "next";
import { dbConnect } from "@/lib/db";
import SiteSettings from "@/models/SiteSettings";
import { plain } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/Card";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const metadata: Metadata = { title: "Settings", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await dbConnect();
  const doc =
    (await SiteSettings.findOne({ key: "main" }).lean()) ??
    (await SiteSettings.create({ key: "main" })).toObject();

  return (
    <div>
      <SectionHeading title="Site settings" subtitle="Hero content, contact details, social links and SEO defaults." />
      <SettingsForm initial={plain(doc)} />
    </div>
  );
}
