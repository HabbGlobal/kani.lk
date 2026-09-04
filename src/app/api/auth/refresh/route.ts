import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/db";
import AdminUser from "@/models/AdminUser";
import {
  REFRESH_COOKIE,
  createSession,
  destroySession,
  verifyRefreshToken,
} from "@/lib/auth";

export const runtime = "nodejs";

/**
 * Exchanges a valid refresh token for a fresh access token. The user record is
 * re-read, so deactivating an account or changing its role takes effect at the
 * next refresh rather than waiting out the token.
 */
export async function POST() {
  const store = await cookies();
  const token = store.get(REFRESH_COOKIE)?.value;

  const userId = token ? await verifyRefreshToken(token) : null;
  if (!userId) {
    await destroySession();
    return NextResponse.json({ error: "Session expired" }, { status: 401 });
  }

  await dbConnect();
  const user = await AdminUser.findById(userId).lean();

  if (!user || !user.isActive) {
    await destroySession();
    return NextResponse.json({ error: "Session expired" }, { status: 401 });
  }

  await createSession({
    id: String(user._id),
    email: user.email,
    name: user.name,
    role: user.role,
  });

  return NextResponse.json({ ok: true });
}
