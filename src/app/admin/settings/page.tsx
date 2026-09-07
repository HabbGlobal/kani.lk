import type { Metadata } from "next";
import { dbConnect } from "@/lib/db";
import SiteSettings from "@/models/SiteSettings";
import { plain } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/Card";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { getDictionary } from "@/lib/i18n";
import { adminLocale } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Settings", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const d = getDictionary(await adminLocale());
  await dbConnect();
  const doc =
    (await SiteSettings.findOne({ key: "main" }).lean()) ??
    (await SiteSettings.create({ key: "main" })).toObject();

  return (
    <div>
      <SectionHeading title={d.admin.siteSettings} subtitle={d.admin.settingsSub} />
      <SettingsForm initial={plain(doc)} />
    </div>
  );
}
