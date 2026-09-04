import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Land from "@/models/Land";
import KaniImage from "@/models/Image";
import { requireSession } from "@/lib/auth";
import { authErrorResponse } from "@/lib/api";
import { makeLqip } from "@/lib/images";
import { revalidateLandPages } from "@/lib/revalidate";
import { plain } from "@/lib/utils";

export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    await requireSession();
  } catch (err) {
    return authErrorResponse(err) ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, imageId } = await ctx.params;
  await dbConnect();

  const land = await Land.findById(id);
  if (!land) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  land.imageIds = (land.imageIds ?? []).filter((imgId) => String(imgId) !== imageId);
  await KaniImage.findByIdAndDelete(imageId);

  const wasCover = String(land.coverImageId ?? "") === imageId;
  if (wasCover) {
    const nextCoverId = land.imageIds[0];
    land.coverImageId = nextCoverId;
    if (nextCoverId) {
      const coverDoc = await KaniImage.findById(nextCoverId).select("data").lean();
      land.coverThumb = coverDoc ? await makeLqip(Buffer.from(coverDoc.data, "base64")) : "";
    } else {
      land.coverThumb = "";
    }
  }

  await land.save();
  revalidateLandPages(land.slug);

  return NextResponse.json({ item: plain(land.toObject()) });
}
