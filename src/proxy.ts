import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

/**
 * Guards every /admin route and every mutating admin API call. Named `proxy`
 * (not `middleware`) per the Next 16 convention — the file itself keeps the
 * same behavior.
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
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
