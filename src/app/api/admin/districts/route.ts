import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import District from "@/models/District";
import { districtSchema } from "@/lib/validation";
import { requireSession } from "@/lib/auth";
import { authErrorResponse, zodErrorResponse } from "@/lib/api";
import { uniqueSlug } from "@/lib/slug";
import { revalidateTaxonomyPages } from "@/lib/revalidate";
import { plain } from "@/lib/utils";

export const runtime = "nodejs";

/** Admin list includes inactive rows — the public getTaxonomies() does not. */
export async function GET() {
  try {
    await requireSession();
  } catch (err) {
    return authErrorResponse(err) ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const districts = await District.find({}).sort({ order: 1, name: 1 }).lean();
  return NextResponse.json({ items: plain(districts) });
}

export async function POST(req: Request) {
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

  const parsed = districtSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  await dbConnect();

  const slug = await uniqueSlug(parsed.data.name, async (candidate) =>
    Boolean(await District.exists({ slug: candidate }))
  );

  const doc = await District.create({ ...parsed.data, slug });
  revalidateTaxonomyPages();

  return NextResponse.json({ item: plain(doc.toObject()) }, { status: 201 });
}
