import type { MetadataRoute } from "next";
import { dbConnect } from "@/lib/db";
import Land from "@/models/Land";
import District from "@/models/District";

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kani.lk";

/**
 * Dynamic sitemap: static routes plus every published listing and active
 * district. Regenerated on each request (Next caches it per its own rules) so
 * a newly published listing shows up without a redeploy.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await dbConnect();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: site, changeFrequency: "daily", priority: 1 },
    { url: `${site}/lands`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${site}/for-sale`, changeFrequency: "daily", priority: 0.8 },
    { url: `${site}/for-rent`, changeFrequency: "daily", priority: 0.8 },
    { url: `${site}/districts`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${site}/favourites`, changeFrequency: "monthly", priority: 0.2 },
    { url: `${site}/about`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${site}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${site}/terms`, changeFrequency: "yearly", priority: 0.1 },
    { url: `${site}/privacy`, changeFrequency: "yearly", priority: 0.1 },
  ];

  const [lands, districts] = await Promise.all([
    Land.find({ isPublished: true })
      .select("slug updatedAt")
      .sort({ updatedAt: -1 })
      .limit(5000)
      .lean(),
    District.find({ isActive: true }).select("slug updatedAt").lean(),
  ]);

  const landRoutes: MetadataRoute.Sitemap = lands.map((l) => ({
    url: `${site}/lands/${l.slug}`,
    lastModified: l.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const districtRoutes: MetadataRoute.Sitemap = districts.map((d) => ({
    url: `${site}/districts/${d.slug}`,
    lastModified: d.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...districtRoutes, ...landRoutes];
}
