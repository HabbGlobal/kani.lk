import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import City from "@/models/City";
import { citySchema } from "@/lib/validation";
import { requireSession } from "@/lib/auth";
import { authErrorResponse, zodErrorResponse } from "@/lib/api";
import { uniqueSlug } from "@/lib/slug";
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
  const cities = await City.find({}).sort({ order: 1, name: 1 }).populate({ path: "district", select: "name" }).lean();
  return NextResponse.json({ items: plain(cities) });
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

  const parsed = citySchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  await dbConnect();

  // Uniqueness is scoped to the district, matching the schema's compound index.
  const slug = await uniqueSlug(parsed.data.name, async (candidate) =>
    Boolean(await City.exists({ slug: candidate, district: parsed.data.district }))
  );

  const doc = await City.create({ ...parsed.data, slug });
  revalidateTaxonomyPages();

  return NextResponse.json({ item: plain(doc.toObject()) }, { status: 201 });
}
