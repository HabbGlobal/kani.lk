import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { I18nProvider } from "@/lib/i18n/client";
import { LOCALE_COOKIE, toLocale } from "@/lib/i18n/config";

/**
 * Middleware already redirects a signed-out visitor to /admin/login for every
 * path under /admin except the auth pages themselves — this layout renders for
 * both, so it only wraps in the shell when there is a session to show.
 *
 * Admin routes deliberately sit outside the public `[lang]` segment: an admin
 * URL is a working tool, not something to be indexed or shared per language.
 * The locale therefore comes from the same cookie the public switch writes, so
 * choosing Tamil on the site carries into the dashboard and back.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, store] = await Promise.all([getSession(), cookies()]);
  const locale = toLocale(store.get(LOCALE_COOKIE)?.value);

  return (
    <I18nProvider locale={locale}>
      {user ? <AdminShell user={user}>{children}</AdminShell> : children}
    </I18nProvider>
  );
}
