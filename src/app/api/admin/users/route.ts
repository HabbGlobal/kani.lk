import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import AdminUser from "@/models/AdminUser";
import { adminUserSchema } from "@/lib/validation";
import { requireSession } from "@/lib/auth";
import { authErrorResponse, zodErrorResponse } from "@/lib/api";
import { plain } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireSession("superadmin");
  } catch (err) {
    return authErrorResponse(err) ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  // passwordHash has select:false on the schema, so a plain find() never returns it.
  const users = await AdminUser.find({}).sort({ createdAt: 1 }).lean();
  return NextResponse.json({ items: plain(users) });
}

export async function POST(req: Request) {
  try {
    await requireSession("superadmin");
  } catch (err) {
    return authErrorResponse(err) ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = adminUserSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  if (!parsed.data.password) {
    return NextResponse.json({ error: "A password is required for a new admin user" }, { status: 400 });
  }

  await dbConnect();

  const existing = await AdminUser.exists({ email: parsed.data.email });
  if (existing) {
    return NextResponse.json({ error: "An admin user with that email already exists" }, { status: 409 });
  }

  const doc = await AdminUser.create({
    name: parsed.data.name,
    email: parsed.data.email,
    role: parsed.data.role,
    isActive: parsed.data.isActive,
    passwordHash: await bcrypt.hash(parsed.data.password, 12),
  });

  const { passwordHash: _drop, ...safe } = doc.toObject();
  void _drop;

  return NextResponse.json({ item: plain(safe) }, { status: 201 });
}
