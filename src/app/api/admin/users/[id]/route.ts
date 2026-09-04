import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import AdminUser from "@/models/AdminUser";
import { adminUserSchema } from "@/lib/validation";
import { requireSession } from "@/lib/auth";
import { authErrorResponse, zodErrorResponse } from "@/lib/api";
import { plain } from "@/lib/utils";

export const runtime = "nodejs";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  let self;
  try {
    self = await requireSession("superadmin");
  } catch (err) {
    return authErrorResponse(err) ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = adminUserSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  // A superadmin locking themselves out is an unrecoverable mistake — refuse it.
  if (id === self.id && (parsed.data.isActive === false || parsed.data.role !== "superadmin")) {
    return NextResponse.json(
      { error: "You cannot deactivate or demote your own account" },
      { status: 400 }
    );
  }

  await dbConnect();

  const update: Record<string, unknown> = {
    name: parsed.data.name,
    email: parsed.data.email,
    role: parsed.data.role,
    isActive: parsed.data.isActive,
  };
  // Password field only sets/changes the password when non-empty.
  if (parsed.data.password) {
    update.passwordHash = await bcrypt.hash(parsed.data.password, 12);
  }

  const doc = await AdminUser.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true }).lean();
  if (!doc) return NextResponse.json({ error: "Admin user not found" }, { status: 404 });

  return NextResponse.json({ item: plain(doc) });
}
