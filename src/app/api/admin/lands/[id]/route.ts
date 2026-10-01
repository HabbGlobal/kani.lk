import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Land from "@/models/Land";
import District from "@/models/District";
import City from "@/models/City";
import LandType from "@/models/LandType";
import KaniImage from "@/models/Image";
import { deleteObjects } from "@/lib/s3";
import { landSchema } from "@/lib/validation";
import { requireSession } from "@/lib/auth";
import { authErrorResponse, zodErrorResponse } from "@/lib/api";
import { revalidateLandPages } from "@/lib/revalidate";
import { plain } from "@/lib/utils";
import { z } from "zod";

export const runtime = "nodejs";

/** The Featured hero rail and the Popular row (manual mode) each only ever
 * render this many on the homepage — see CLAUDE.md. Enforced here, not just
 * in the admin UI, since the UI check is trivially bypassed by calling this
 * endpoint directly. */
const MAX_FEATURED = 4;
const MAX_POPULAR = 4;

/** Whitelist for the row-level quick toggles in the listing table. */
const toggleSchema = z
  .object({
    isPublished: z.boolean(),
    isFeatured: z.boolean(),
    isPopular: z.boolean(),
    status: z.enum(["available", "reserved", "sold", "rented"]),
    showWhenSold: z.boolean(),
  })
  .partial();

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireSession();
  } catch (err) {
    return authErrorResponse(err) ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  await dbConnect();
  const doc = await Land.findById(id).lean();
  if (!doc) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  return NextResponse.json({ item: plain(doc) });
}

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

  await dbConnect();
  const land = await Land.findById(id);
  if (!land) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  // Newly turning Featured/Popular on (not already set) must respect the
  // cap — re-saving an already-flagged listing, or turning it off, never
  // counts against the limit.
  const patch = body as Record<string, unknown>;
  if (patch?.isFeatured === true && !land.isFeatured) {
    const featuredCount = await Land.countDocuments({ isFeatured: true });
    if (featuredCount >= MAX_FEATURED) {
      return NextResponse.json(
        { error: "You have already added 4 items in Featured." },
        { status: 409 }
      );
    }
  }
  if (patch?.isPopular === true && !land.isPopular) {
    const popularCount = await Land.countDocuments({ isPopular: true });
    if (popularCount >= MAX_POPULAR) {
      return NextResponse.json(
        { error: "You have already added 4 items in Popular." },
        { status: 409 }
      );
    }
  }

  // The full editor form always submits every field; the row-level toggles in
  // the table send only a handful — tell the two apart by whether the body
  // looks like a complete listing (has a title) or a bare toggle patch.
  const isFullSave = typeof (body as Record<string, unknown>)?.title === "string";

  if (isFullSave) {
    const parsed = landSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);
    const data = parsed.data;

    const [district, city, landType] = await Promise.all([
      District.findById(data.district).lean(),
      City.findById(data.city).lean(),
      LandType.findById(data.landType).lean(),
    ]);
    if (!district) return NextResponse.json({ error: "Choose a valid district" }, { status: 400 });
    if (!city) return NextResponse.json({ error: "Choose a valid city or town" }, { status: 400 });
    if (!landType) return NextResponse.json({ error: "Choose a valid land type" }, { status: 400 });

    // refCode and slug are set once at creation and must never move on edit —
    // every field below is settable, but not those two.
    const { imageIds: _imageIds, coverImageId: _coverImageId, ...rest } = data;
    void _imageIds;
    void _coverImageId;
    Object.assign(land, rest, {
      deedType: data.deedType || undefined,
    });
  } else {
    const parsed = toggleSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);
    Object.assign(land, parsed.data);
  }

  await land.save();

  const district = await District.findById(land.district).select("slug").lean();
  revalidateLandPages(land.slug, district?.slug);

  return NextResponse.json({ item: plain(land.toObject()) });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireSession();
  } catch (err) {
    return authErrorResponse(err) ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  await dbConnect();

  const land = await Land.findById(id);
  if (!land) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  const images = await KaniImage.find({ landId: land._id }).select("key").lean();
  await deleteObjects(images.map((img) => img.key)).catch(() => {});
  await KaniImage.deleteMany({ landId: land._id });
  await land.deleteOne();

  const district = await District.findById(land.district).select("slug").lean();
  revalidateLandPages(land.slug, district?.slug);

  return NextResponse.json({ ok: true });
}
