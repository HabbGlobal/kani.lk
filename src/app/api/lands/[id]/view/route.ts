import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import Land from "@/models/Land";

export const runtime = "nodejs";

/**
 * Increments a listing's view count. Called client-side (sendBeacon-style
 * fetch) from the detail page so a page-cache hit (ISR) still records a view —
 * a server-side increment inside the page component would only fire on the
 * cache-miss render, undercounting popular listings badly.
 */
export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  await dbConnect();
  await Land.updateOne({ _id: id, isPublished: true }, { $inc: { viewCount: 1 } });

  return NextResponse.json({ ok: true });
}
