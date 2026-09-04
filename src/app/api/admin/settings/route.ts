import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import SiteSettings from "@/models/SiteSettings";
import { settingsSchema } from "@/lib/validation";
import { requireSession } from "@/lib/auth";
import { authErrorResponse, zodErrorResponse } from "@/lib/api";
import { revalidateTaxonomyPages } from "@/lib/revalidate";
import { plain } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireSession();
  } catch (err) {
    return authErrorResponse(err) ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const doc =
    (await SiteSettings.findOne({ key: "main" }).lean()) ??
    (await SiteSettings.create({ key: "main" })).toObject();

  return NextResponse.json({ item: plain(doc) });
}

export async function PATCH(req: Request) {
  try {
    await requireSession();
  } catch (err) {
    return authErrorResponse(err) ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  await dbConnect();
  // Singleton, upsert-safe: the key "main" is the only row this collection ever holds.
  const doc = await SiteSettings.findOneAndUpdate(
    { key: "main" },
    { $set: parsed.data },
    { new: true, upsert: true, runValidators: true }
  ).lean();

  revalidateTaxonomyPages();
  return NextResponse.json({ item: plain(doc) });
}
