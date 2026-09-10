import type { Metadata } from "next";
import Link from "next/link";
import { dbConnect } from "@/lib/db";
import Land from "@/models/Land";
import SiteSettings from "@/models/SiteSettings";
import District from "@/models/District";
import { PopularManager, type PopularLand } from "@/components/admin/PopularManager";
import { Card } from "@/components/ui/Card";
import { getDictionary } from "@/lib/i18n";
import { adminLocale } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Popular row", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminPopularPage() {
  const d = getDictionary(await adminLocale());
  await dbConnect();

  const [docs, settings] = await Promise.all([
    Land.find({ isPopular: true })
      .select("title refCode coverImageId sizeValue sizeUnit salePrice district")
      .populate({ path: "district", select: "name" })
      .sort({ popularRank: 1 })
      .lean(),
    SiteSettings.findOne({ key: "main" }).select("popularMode").lean(),
  ]);

  const items: PopularLand[] = docs.map((d: any) => ({
    _id: String(d._id),
    title: d.title,
    refCode: d.refCode,
    coverImageId: d.coverImageId ? String(d.coverImageId) : undefined,
    sizeValue: d.sizeValue,
    sizeUnit: d.sizeUnit,
    salePrice: d.salePrice,
    district: d.district?.name ?? "",
  }));

  const mode = settings?.popularMode ?? "manual";

  return (
    <div className="max-w-3xl">
      <header className="mb-6">
        <h1 className="text-[27px] text-[var(--heading)] md:text-[34px]">
          {d.admin.popularRow}
        </h1>
        <p className="mt-1 text-[16px] text-[var(--muted)]">{d.admin.popularSub}</p>
      </header>

      {mode === "automatic" && (
        <Card className="mb-6 border-[var(--palmyra-gold)]/40 bg-[var(--palmyra-gold)]/10 p-4">
          <p className="text-[15px] text-[var(--ink)]">
            {d.admin.popularAutoNote}{" "}
            <Link href="/admin/settings" className="font-medium text-[var(--heading)] hover:underline">
              {d.admin.settings}
            </Link>
            .
          </p>
        </Card>
      )}

      {mode === "manual" && (
        <p className="mb-6 text-[14px] text-[var(--muted)]">
          {d.admin.popularManualNote}{" "}
          <Link href="/admin/settings" className="font-medium text-[var(--heading)] hover:underline">
            {d.admin.settings}
          </Link>{" "}
          {d.admin.popularToRankByViews}
        </p>
      )}

      <PopularManager initial={items} />
    </div>
  );
}
