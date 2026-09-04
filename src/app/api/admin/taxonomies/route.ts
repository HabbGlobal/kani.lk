import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import District from "@/models/District";
import City from "@/models/City";
import LandType from "@/models/LandType";
import { requireSession } from "@/lib/auth";
import { authErrorResponse } from "@/lib/api";
import { plain } from "@/lib/utils";

export const runtime = "nodejs";

/**
 * Full taxonomy lists (including inactive rows) for the land editor's
 * district/city/land-type selects — deliberately not src/lib/queries.ts's
 * getTaxonomies(), which filters to isActive only for the public site.
 */
export async function GET() {
  try {
    await requireSession();
  } catch (err) {
    return authErrorResponse(err) ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const [districts, cities, landTypes] = await Promise.all([
    District.find({}).sort({ order: 1, name: 1 }).select("name slug code isActive").lean(),
    City.find({}).sort({ order: 1, name: 1 }).select("name slug district isActive").lean(),
    LandType.find({}).sort({ order: 1, name: 1 }).select("name slug hasBuilding isActive").lean(),
  ]);

  return NextResponse.json({
    districts: plain(districts),
    cities: plain(cities),
    landTypes: plain(landTypes),
  });
}
