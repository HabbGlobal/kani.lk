import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import Land, { LAND_CARD_PROJECTION } from "@/models/Land";
import { plain } from "@/lib/utils";

export const runtime = "nodejs";

/**
 * Resolve saved-listing ids into cards. The ids live in the visitor's own
 * localStorage, so this is the one place they reach the server — and they are
 * used for nothing but this lookup.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const raw = (body as { ids?: unknown })?.ids;
  if (!Array.isArray(raw)) {
    return NextResponse.json({ items: [] });
  }

  const ids = raw
    .filter((v): v is string => typeof v === "string")
    .filter((v) => mongoose.Types.ObjectId.isValid(v))
    .slice(0, 100);

  if (ids.length === 0) return NextResponse.json({ items: [] });

  await dbConnect();

  const docs = await Land.find({ _id: { $in: ids }, isPublished: true })
    .select(LAND_CARD_PROJECTION)
    .populate([
      { path: "district", select: "name slug code" },
      { path: "city", select: "name slug" },
      { path: "landType", select: "name slug hasBuilding" },
    ])
    .lean();

  // Preserve the order the visitor saved them in — most recent first.
  const order = new Map(ids.map((id, i) => [id, i]));
  const items = plain<Record<string, unknown>[]>(docs).sort(
    (a, b) => (order.get(String(a._id)) ?? 0) - (order.get(String(b._id)) ?? 0)
  );

  return NextResponse.json({ items });
}
