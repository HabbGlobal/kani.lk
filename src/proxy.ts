import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  isLocale,
} from "@/lib/i18n/config";

/**
 * Guards every /admin route and every mutating admin API call, and puts a
 * locale segment on every public URL. Named `proxy` (not `middleware`) per the
 * Next 16 convention.
 *
 * This runs on the edge, so it cannot import the Node-only auth module or touch
 * Mongo. It verifies the JWT signature and nothing more — the route handlers
 * still re-check the session and the role before writing anything.
 */
const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/forgot-password", "/admin/reset-password"];

async function isValidAccessToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const raw = process.env.JWT_SECRET;
  if (!raw) return false;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(raw), {
      issuer: "kani.lk",
    });
    return payload.typ === "access";
  } catch {
    return false;
  }
}

/**
 * Which locale to send a first-time visitor to. The saved cookie always wins —
 * an explicit choice outranks the browser. Otherwise Tamil, unless the browser
 * clearly prefers English: this site's audience reads Tamil by default.
 */
function preferredLocale(req: NextRequest) {
  const saved = req.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(saved)) return saved;

  const header = req.headers.get("accept-language")?.toLowerCase() ?? "";
  // Only a leading English preference flips it; "en" appearing far down the
  // list is just a fallback the browser would accept, not a preference.
  const first = header.split(",")[0]?.trim() ?? "";
  if (first.startsWith("en")) return "en";

  return DEFAULT_LOCALE;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("kani_at")?.value;
  const signedIn = await isValidAccessToken(token);

  // Admin API: never redirect, return 401 so the client can handle it.
  if (pathname.startsWith("/api/admin")) {
    if (!signedIn) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }
    return NextResponse.next();
  }

  const isPublicAdminPath = PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p));

  if (pathname.startsWith("/admin")) {
    if (!signedIn && !isPublicAdminPath) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      // Send them back where they were headed after signing in.
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    // Already signed in: the login page is pointless.
    if (signedIn && pathname === "/admin/login") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // API routes are not pages: they have no locale segment and must never be
  // redirected into one, or every fetch to /api/... breaks.
  if (pathname.startsWith("/api")) return NextResponse.next();

  // ---- Public site: every URL carries its locale. ----
  const hasLocale = LOCALES.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );

  if (!hasLocale) {
    const locale = preferredLocale(req);
    const url = req.nextUrl.clone();
    url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
    return NextResponse.redirect(url);
  }

  // Keep the cookie in step with the URL, so a visitor who lands on an /en link
  // and then opens the bare domain stays in English.
  const current = pathname.split("/")[1];
  const res = NextResponse.next();
  if (isLocale(current) && req.cookies.get(LOCALE_COOKIE)?.value !== current) {
    res.cookies.set(LOCALE_COOKIE, current, {
      path: "/",
      maxAge: LOCALE_COOKIE_MAX_AGE,
      sameSite: "lax",
    });
  }
  return res;
}

export const config = {
  matcher: [
    /*
     * Everything except Next internals, the image endpoint, and public files.
     * The public site now needs the proxy on every route (not just /admin) so
     * a bare URL can be redirected to its locale.
     */
    "/((?!_next/static|_next/image|api/images|favicon.ico|favicon.png|logo.png|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)",
  ],
};
