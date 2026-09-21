import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { imageKey, publicUrl } from "@/lib/s3";

/**
 * The single delivery point for every stored photo. The bytes live in
 * S3-compatible storage at `kani.lk/<id>.webp`; this route streams them back
 * with an immutable cache header — the id never changes for a given image, so
 * the visitor pays for each photo exactly once.
 *
 * The key is derived from the id, so no database lookup is needed. Keeping the
 * /api/images/[id] URL stable means components and next/image are untouched by
 * where the bytes actually live.
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

  const etag = `"${id}"`;
  const cacheControl = "public, max-age=31536000, immutable";

  // Cheap revalidation: the object for an id never changes.
  if (req.headers.get("if-none-match") === etag) {
    return new NextResponse(null, {
      status: 304,
      headers: { ETag: etag, "Cache-Control": cacheControl },
    });
  }

  let upstream: Response;
  try {
    upstream = await fetch(publicUrl(imageKey(id)));
  } catch {
    return new NextResponse("Storage unavailable", { status: 502 });
  }

  if (upstream.status === 404 || upstream.status === 403) {
    return new NextResponse("Not found", { status: 404 });
  }
  if (!upstream.ok || !upstream.body) {
    return new NextResponse("Storage unavailable", { status: 502 });
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": upstream.headers.get("content-type") || "image/webp",
      ...(upstream.headers.get("content-length")
        ? { "Content-Length": upstream.headers.get("content-length")! }
        : {}),
      "Cache-Control": cacheControl,
      ETag: etag,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
