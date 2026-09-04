import type { Metadata } from "next";
import Link from "next/link";
import { dbConnect } from "@/lib/db";
import Land from "@/models/Land";
import SiteSettings from "@/models/SiteSettings";
import District from "@/models/District";
import { PopularManager, type PopularLand } from "@/components/admin/PopularManager";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Popular row", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminPopularPage() {
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
        <h1 className="text-[27px] text-[var(--kani-green)] md:text-[34px]">
          Popular row
        </h1>
        <p className="mt-1 text-[16px] text-[var(--muted)]">
          Drag to reorder the &ldquo;Most popular lands&rdquo; row on the homepage.
        </p>
      </header>

      {mode === "automatic" && (
        <Card className="mb-6 border-[var(--palmyra-gold)]/40 bg-[var(--palmyra-gold)]/10 p-4">
          <p className="text-[15px] text-[var(--ink)]">
            The popular row is currently in <strong>automatic</strong> mode —
            it orders by 30-day view count, and this manual order is ignored
            until you switch back. Change the mode in{" "}
            <Link href="/admin/settings" className="font-medium text-[var(--kani-green)] hover:underline">
              Settings
            </Link>
            .
          </p>
        </Card>
      )}

      {mode === "manual" && (
        <p className="mb-6 text-[14px] text-[var(--muted)]">
          Manual mode is on — this order is what visitors see. Switch to
          automatic in{" "}
          <Link href="/admin/settings" className="font-medium text-[var(--kani-green)] hover:underline">
            Settings
          </Link>{" "}
          to rank by views instead.
        </p>
      )}

      <PopularManager initial={items} />
    </div>
  );
}
