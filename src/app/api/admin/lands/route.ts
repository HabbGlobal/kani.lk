import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Land from "@/models/Land";
import District from "@/models/District";
import City from "@/models/City";
import LandType from "@/models/LandType";
import { landSchema } from "@/lib/validation";
import { requireSession } from "@/lib/auth";
import { authErrorResponse, zodErrorResponse } from "@/lib/api";
import { buildLandSlug } from "@/lib/slug";
import { formatSize } from "@/lib/units";
import { revalidateLandPages } from "@/lib/revalidate";
import { plain } from "@/lib/utils";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let user;
  try {
    user = await requireSession();
  } catch (err) {
    return authErrorResponse(err) ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = landSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);
  const data = parsed.data;

  await dbConnect();

  const [district, city, landType] = await Promise.all([
    District.findById(data.district).lean(),
    City.findById(data.city).lean(),
    LandType.findById(data.landType).lean(),
  ]);
  if (!district) return NextResponse.json({ error: "Choose a valid district" }, { status: 400 });
  if (!city) return NextResponse.json({ error: "Choose a valid city or town" }, { status: 400 });
  if (!landType) return NextResponse.json({ error: "Choose a valid land type" }, { status: 400 });

  // refCode + slug are generated once, here, and never touched again on edit.
  const n = (await Land.countDocuments({ district: district._id })) + 1;
  const refCode = `KANI-${district.code}-${String(n).padStart(4, "0")}`;
  const slug = buildLandSlug({
    sizeLabel: formatSize(data.sizeValue, data.sizeUnit),
    landType: landType.name,
    area: data.area || city.name,
    district: district.name,
    refCode,
  });

  const doc = new Land({
    ...data,
    deedType: data.deedType || undefined,
    coverImageId: data.coverImageId || undefined,
    refCode,
    slug,
    createdBy: user.id,
  });
  await doc.save();

  revalidateLandPages(doc.slug, district.slug);

  return NextResponse.json({ item: plain(doc.toObject()) }, { status: 201 });
}
