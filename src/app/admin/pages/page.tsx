import type { Metadata } from "next";
import Link from "next/link";
import { dbConnect } from "@/lib/db";
import Page from "@/models/Page";
import { plain } from "@/lib/utils";
import { Card, SectionHeading } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Pages", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  await dbConnect();
  const pages = await Page.find({}).sort({ slug: 1 }).lean();

  return (
    <div className="max-w-2xl">
      <SectionHeading title="Content pages" subtitle="About, terms and privacy — the three fixed pages on the public site." />
      <Card className="divide-y divide-[var(--hairline)] overflow-hidden">
        {plain<{ _id: string; slug: string; title: string; updatedAt: string }[]>(pages).map((p) => (
          <Link
            key={p._id}
            href={`/admin/pages/${p.slug}`}
            className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-black/[0.02]"
          >
            <div>
              <p className="text-[15px] font-medium text-[var(--ink)]">{p.title}</p>
              <p className="text-[13px] text-[var(--muted)]">/{p.slug}</p>
            </div>
            <span className="text-[14px] font-medium text-[var(--kani-green)]">Edit</span>
          </Link>
        ))}
      </Card>
    </div>
  );
}
