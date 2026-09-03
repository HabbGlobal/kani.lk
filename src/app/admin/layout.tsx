import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

/**
 * Middleware already redirects a signed-out visitor to /admin/login for every
 * path under /admin except the auth pages themselves — this layout renders for
 * both, so it only wraps in the shell when there is a session to show.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();

  if (!user) return <>{children}</>;

  return <AdminShell user={user}>{children}</AdminShell>;
}
