import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import AdminUser from "@/models/AdminUser";
import { loginSchema } from "@/lib/validation";
import { createSession } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = clientIp(req);

  // 5 attempts per 15 minutes per IP.
  const limit = rateLimit(`login:${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 });
  if (!limit.ok) {
    return NextResponse.json(
      {
        error: `Too many sign-in attempts. Try again in ${Math.ceil(
          limit.retryAfterSeconds / 60
        )} minutes.`,
      },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Check your details" },
      { status: 400 }
    );
  }

  await dbConnect();

  const user = await AdminUser.findOne({ email: parsed.data.email })
    .select("+passwordHash")
    .lean();

  // One message for every failure mode — never reveal whether an email exists.
  const invalid = NextResponse.json(
    { error: "Email or password is incorrect" },
    { status: 401 }
  );

  if (!user || !user.isActive) {
    // Still spend the time hashing, so a missing account is not detectably faster.
    await bcrypt.compare(parsed.data.password, "$2a$12$invalidsaltinvalidsaltuO");
    return invalid;
  }

  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!ok) return invalid;

  await createSession({
    id: String(user._id),
    email: user.email,
    name: user.name,
    role: user.role,
  });

  await AdminUser.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } });

  return NextResponse.json({
    ok: true,
    user: { name: user.name, email: user.email, role: user.role },
  });
}
