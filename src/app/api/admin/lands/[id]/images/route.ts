import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import Land from "@/models/Land";
import KaniImage from "@/models/Image";
import { requireSession } from "@/lib/auth";
import { authErrorResponse, zodErrorResponse } from "@/lib/api";
import { processImage, makeLqip, storeImage, MAX_IMAGES_PER_LAND, ImageTooLargeError } from "@/lib/images";
import { revalidateLandPages } from "@/lib/revalidate";
import { plain } from "@/lib/utils";

export const runtime = "nodejs";

/** Multipart upload: one or more files under the "files" field. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireSession();
  } catch (err) {
    return authErrorResponse(err) ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  await dbConnect();

  const land = await Land.findById(id);
  if (!land) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }

  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: "No files were uploaded" }, { status: 400 });
  }

  const currentCount = land.imageIds?.length ?? 0;
  if (currentCount + files.length > MAX_IMAGES_PER_LAND) {
    return NextResponse.json(
      { error: `A listing can carry at most ${MAX_IMAGES_PER_LAND} photos (${currentCount} already uploaded).` },
      { status: 400 }
    );
  }

  const newIds = [];
  let order = currentCount;
  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    let processed;
    try {
      // Only the cover (the first photo overall) is watermarked.
      processed = await processImage(buffer, {
        watermark: order === 0,
        filename: file.name,
      });
    } catch (err) {
      if (err instanceof ImageTooLargeError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      return NextResponse.json({ error: "Could not process one of the photos" }, { status: 400 });
    }
    const imageId = await storeImage(processed, { landId: land._id, order });
    newIds.push(imageId);

    if (order === 0) {
      land.coverThumb = await makeLqip(buffer);
    }
    order += 1;
  }

  land.imageIds = [...(land.imageIds ?? []), ...newIds];
  if (!land.coverImageId) land.coverImageId = newIds[0];
  await land.save();

  revalidateLandPages(land.slug);

  return NextResponse.json({ imageIds: newIds.map(String), item: plain(land.toObject()) }, { status: 201 });
}

const reorderSchema = z.object({
  imageIds: z.array(z.string()).min(1),
  coverImageId: z.string().optional(),
});

/** Reorder + cover selection in one call. */
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

  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  await dbConnect();
  const land = await Land.findById(id);
  if (!land) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  const known = new Set((land.imageIds ?? []).map(String));
  const ordered = parsed.data.imageIds.filter((imgId) => known.has(imgId));
  if (ordered.length !== known.size) {
    return NextResponse.json({ error: "The image list did not match this listing's photos" }, { status: 400 });
  }

  await Promise.all(
    ordered.map((imgId, i) => KaniImage.updateOne({ _id: imgId }, { $set: { order: i } }))
  );

  land.imageIds = ordered.map((imgId) => imgId as unknown as typeof land.imageIds[number]);

  const coverChanged =
    parsed.data.coverImageId && parsed.data.coverImageId !== String(land.coverImageId ?? "");
  if (coverChanged) {
    land.coverImageId = parsed.data.coverImageId as unknown as typeof land.coverImageId;
    // Regenerate the LQIP from the newly-chosen cover's own stored bytes.
    const coverDoc = await KaniImage.findById(parsed.data.coverImageId).select("data").lean();
    if (coverDoc) {
      land.coverThumb = await makeLqip(Buffer.from(coverDoc.data, "base64"));
    }
  }

  await land.save();
  revalidateLandPages(land.slug);

  return NextResponse.json({ item: plain(land.toObject()) });
}
