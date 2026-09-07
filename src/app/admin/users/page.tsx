import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import AdminUser from "@/models/AdminUser";
import { plain } from "@/lib/utils";
import { SectionHeading, EmptyState } from "@/components/ui/Card";
import { UsersManager } from "@/components/admin/UsersManager";
import { getDictionary } from "@/lib/i18n";
import { adminLocale } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Admin users", robots: { index: false } };
export const dynamic = "force-dynamic";

/**
 * The nav already hides this link for non-superadmins, but a direct URL visit
 * must still be blocked here — the page itself is the real guard.
 */
export default async function AdminUsersPage() {
  const [user, locale] = await Promise.all([getSession(), adminLocale()]);
  const d = getDictionary(locale);

  if (!user || user.role !== "superadmin") {
    return (
      <div className="max-w-lg">
        <EmptyState title={d.admin.superadminRequired}>
          {d.admin.superadminOnly}
        </EmptyState>
      </div>
    );
  }

  await dbConnect();
  // passwordHash has select:false — a plain lean() never returns it.
  const users = await AdminUser.find({}).sort({ createdAt: 1 }).lean();

  return (
    <div className="max-w-2xl">
      <SectionHeading title={d.admin.adminUsers} subtitle={d.admin.usersSub} />
      <UsersManager initialRows={plain(users)} selfId={user.id} />
    </div>
  );
}
