import "server-only";
import { dbConnect } from "./db";
import District from "@/models/District";
import City from "@/models/City";
import LandType from "@/models/LandType";
import { plain } from "./utils";

/**
 * Full taxonomy lists including inactive rows — for admin screens only.
 * The public site's src/lib/queries.ts getTaxonomies() filters to isActive;
 * an admin editing a listing still needs to see (and keep) a district the
 * site has since hidden. Mirrors GET /api/admin/taxonomies, used here to
 * avoid an extra HTTP round-trip from server components that already run
 * inside the request.
 */
export async function getAdminTaxonomies() {
  await dbConnect();
  const [districts, cities, landTypes] = await Promise.all([
    District.find({}).sort({ order: 1, name: 1 }).select("name slug code isActive").lean(),
    City.find({}).sort({ order: 1, name: 1 }).select("name slug district isActive").lean(),
    LandType.find({}).sort({ order: 1, name: 1 }).select("name slug hasBuilding isActive").lean(),
  ]);

  return {
    districts: plain<{ _id: string; name: string; slug: string; code: string }[]>(districts),
    cities: plain<{ _id: string; name: string; slug: string; district: string }[]>(cities),
    landTypes: plain<{ _id: string; name: string; slug: string; hasBuilding: boolean }[]>(landTypes),
  };
}
