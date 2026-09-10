import type { Metadata } from "next";
import Link from "next/link";
import { dbConnect } from "@/lib/db";
import Page from "@/models/Page";
import { plain } from "@/lib/utils";
import { Card, SectionHeading } from "@/components/ui/Card";
import { getDictionary } from "@/lib/i18n";
import { adminLocale } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Pages", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  const d = getDictionary(await adminLocale());
  await dbConnect();
  const pages = await Page.find({}).sort({ slug: 1 }).lean();

  return (
    <div className="max-w-2xl">
      <SectionHeading
        title={d.admin.contentPages}
        subtitle={d.admin.contentPagesSub}
      />
      <Card className="divide-y divide-[var(--hairline)] overflow-hidden">
        {plain<{ _id: string; slug: string; title: string; updatedAt: string }[]>(pages).map((p) => (
          <Link
            key={p._id}
            href={`/admin/pages/${p.slug}`}
            className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-[var(--hover-tint)]"
          >
            <div>
              <p className="text-[15px] font-medium text-[var(--ink)]">{p.title}</p>
              <p className="text-[13px] text-[var(--muted)]">/{p.slug}</p>
            </div>
            <span className="text-[14px] font-medium text-[var(--heading)]">
              {d.common.edit}
            </span>
          </Link>
        ))}
      </Card>
    </div>
  );
}
