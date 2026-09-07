import "server-only";
import { cookies } from "next/headers";
import { LOCALE_COOKIE, toLocale, type Locale } from "./config";

/**
 * The active locale for an admin Server Component.
 *
 * Public pages take their locale from the `[lang]` route segment. Admin routes
 * have no such segment by design, so they read the cookie the language switch
 * writes — the same one the public site uses, which is what makes the choice
 * carry across both.
 */
export async function adminLocale(): Promise<Locale> {
  return toLocale((await cookies()).get(LOCALE_COOKIE)?.value);
}
