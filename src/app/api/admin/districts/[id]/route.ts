import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import District from "@/models/District";
import Land from "@/models/Land";
import { districtSchema } from "@/lib/validation";
import { requireSession } from "@/lib/auth";
import { authErrorResponse, zodErrorResponse } from "@/lib/api";
import { revalidateTaxonomyPages } from "@/lib/revalidate";
import { plain } from "@/lib/utils";

export const runtime = "nodejs";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireSession();
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

  const parsed = districtSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  await dbConnect();
  // Name changes on edit; the slug (and thus the district's public URL) never does.
  const doc = await District.findByIdAndUpdate(id, { $set: parsed.data }, { new: true, runValidators: true }).lean();
  if (!doc) return NextResponse.json({ error: "District not found" }, { status: 404 });

  revalidateTaxonomyPages();
  return NextResponse.json({ item: plain(doc) });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireSession();
  } catch (err) {
    return authErrorResponse(err) ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  await dbConnect();

  // Deleting a district out from under referencing listings would corrupt them.
  const inUse = await Land.countDocuments({ district: id });
  if (inUse > 0) {
    return NextResponse.json(
      { error: `${inUse} listing${inUse === 1 ? "" : "s"} still use this district. Reassign or deactivate it instead.` },
      { status: 409 }
    );
  }

  const doc = await District.findByIdAndDelete(id).lean();
  if (!doc) return NextResponse.json({ error: "District not found" }, { status: 404 });

  revalidateTaxonomyPages();
  return NextResponse.json({ ok: true });
}
