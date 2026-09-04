import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import KaniImage from "@/models/Image";

/**
 * The single delivery point for every stored photo. Decodes base64 back to
 * binary and serves it with an immutable cache header — the id never changes
 * for a given image, so the visitor pays for each photo exactly once.
 *
 * This route is also the whole migration surface: moving to object storage
 * later is a change here and nowhere else.
 */
export const runtime = "nodejs";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return new NextResponse("Not found", { status: 404 });
  }

  await dbConnect();

  const doc = await KaniImage.findById(id)
    .select({ data: 1, mimeType: 1, bytes: 1 })
    .lean();

  if (!doc) {
    return new NextResponse("Not found", { status: 404 });
  }

  const etag = `"${id}-${doc.bytes}"`;

  // Cheap revalidation: no decode, no body.
  if (req.headers.get("if-none-match") === etag) {
    return new NextResponse(null, {
      status: 304,
      headers: {
        ETag: etag,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  const buffer = Buffer.from(doc.data, "base64");

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": doc.mimeType || "image/webp",
      "Content-Length": String(buffer.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      ETag: etag,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
