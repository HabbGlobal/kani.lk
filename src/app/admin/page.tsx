import type { Metadata } from "next";
import Link from "next/link";
import { dbConnect } from "@/lib/db";
import Land from "@/models/Land";
import Inquiry from "@/models/Inquiry";
import { getSession } from "@/lib/auth";
import { formatDate, timeAgo, plain } from "@/lib/utils";
import { formatLKR } from "@/lib/units";
import { Card } from "@/components/ui/Card";
import { getDictionary, interpolate } from "@/lib/i18n";
import { adminLocale } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [user, locale] = await Promise.all([getSession(), adminLocale()]);
  const d = getDictionary(locale);
  await dbConnect();

  const [
    totalLands,
    publishedLands,
    unpublishedLands,
    soldLands,
    newInquiries,
    totalInquiries,
    recentInquiries,
    recentLands,
  ] = await Promise.all([
    Land.countDocuments({}),
    Land.countDocuments({ isPublished: true }),
    Land.countDocuments({ isPublished: false }),
    Land.countDocuments({ status: { $in: ["sold", "rented"] } }),
    Inquiry.countDocuments({ isHandled: false }),
    Inquiry.countDocuments({}),
    Inquiry.find({}).sort({ createdAt: -1 }).limit(6).lean(),
    Land.find({}).sort({ createdAt: -1 }).limit(6).select("title refCode status isPublished createdAt slug").lean(),
  ]);

  const stats = [
    {
      label: d.admin.publishedListings,
      value: publishedLands,
      href: "/admin/lands?status=published",
    },
    {
      label: d.admin.awaitingPublish,
      value: unpublishedLands,
      href: "/admin/lands?status=draft",
    },
    { label: d.admin.soldRented, value: soldLands, href: "/admin/lands?status=sold" },
    {
      label: d.admin.newEnquiries,
      value: newInquiries,
      href: "/admin/inquiries",
      accent: newInquiries > 0,
    },
  ];

  return (
    <div className="max-w-6xl">
      <header className="mb-8">
        <h1 className="text-[27px] text-[var(--heading)] md:text-[34px]">
          {interpolate(d.admin.welcomeBack, {
            name: user?.name?.split(" ")[0] ?? "",
          })}
        </h1>
        <p className="mt-1 text-[16px] text-[var(--muted)]">
          {interpolate(d.admin.dashboardSub, {
            lands: totalLands,
            inquiries: totalInquiries,
          })}
        </p>
      </header>

      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-[var(--radius-lg)] border border-[var(--hairline)] bg-[var(--card)] p-5
                       transition-[border-color,transform] duration-200
                       [transition-timing-function:var(--ease-out)]
                       hover:-translate-y-0.5 hover:border-[var(--kani-green)]/35"
          >
            <p className="text-[13px] uppercase tracking-wide text-[var(--muted)]">{s.label}</p>
            <p className={`mt-1 font-serif text-[34px] ${s.accent ? "text-[var(--laterite)]" : "text-[var(--heading)]"}`}>
              {s.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[19px] text-[var(--heading)]">
              {d.admin.recentEnquiries}
            </h2>
            <Link href="/admin/inquiries" className="text-[14px] font-medium text-[var(--heading)] hover:underline">
              {d.admin.viewAll}
            </Link>
          </div>
          {recentInquiries.length === 0 ? (
            <p className="text-[15px] text-[var(--muted)]">{d.admin.noEnquiries}</p>
          ) : (
            <ul className="divide-y divide-[var(--hairline)]">
              {plain<any[]>(recentInquiries).map((iq) => (
                <li key={iq._id} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-medium text-[var(--ink)]">{iq.name}</p>
                    <p className="truncate text-[14px] text-[var(--muted)]">
                      {iq.landTitle ?? d.admin.generalEnquiry}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    {!iq.isHandled && (
                      <span className="mb-1 inline-block rounded-[var(--radius-pill)] bg-[var(--laterite)]/12
                                       px-2 py-0.5 text-[11px] font-semibold uppercase text-[var(--laterite)]">
                        {d.admin.newBadge}
                      </span>
                    )}
                    <p className="text-[13px] text-[var(--muted)]">{timeAgo(iq.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[19px] text-[var(--heading)]">
              {d.admin.recentListings}
            </h2>
            <Link href="/admin/lands" className="text-[14px] font-medium text-[var(--heading)] hover:underline">
              {d.admin.viewAll}
            </Link>
          </div>
          <ul className="divide-y divide-[var(--hairline)]">
            {plain<any[]>(recentLands).map((land) => (
              <li key={land._id}>
                <Link
                  href={`/admin/lands/${land._id}/edit`}
                  className="flex items-center justify-between gap-3 py-3 transition-colors hover:text-[var(--heading)]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-medium">{land.title}</p>
                    <p className="tabular text-[13px] text-[var(--muted)]">{land.refCode}</p>
                  </div>
                  <div className="shrink-0 text-right text-[13px]">
                    <span className={land.isPublished ? "text-[var(--paddy)]" : "text-[var(--muted)]"}>
                      {land.isPublished ? d.admin.published : d.admin.draft}
                    </span>
                    <p className="text-[var(--muted)]">{formatDate(land.createdAt)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
