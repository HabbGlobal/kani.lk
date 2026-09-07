import type { MetadataRoute } from "next";
import { dbConnect } from "@/lib/db";
import Land from "@/models/Land";
import District from "@/models/District";
import { DEFAULT_LOCALE, LOCALES } from "@/lib/i18n/config";

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kani.lk";

/**
 * Dynamic sitemap: static routes plus every published listing and active
 * district. Regenerated on each request (Next caches it per its own rules) so
 * a newly published listing shows up without a redeploy.
 *
 * Every path is emitted once per locale, because an unprefixed URL is only a
 * redirect now. Each entry carries `alternates.languages` so Google treats the
 * Tamil and English versions as translations of one page rather than as
 * duplicates competing with each other.
 */
type Route = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
  lastModified?: Date | string;
};

/** `/lands` -> one entry per locale, cross-linked with hreflang. */
function localized(route: Route): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    LOCALES.map((l) => [l === "ta" ? "ta-LK" : "en-LK", `${site}/${l}${route.path}`])
  );

  return LOCALES.map((locale) => ({
    url: `${site}/${locale}${route.path}`,
    lastModified: route.lastModified,
    changeFrequency: route.changeFrequency,
    // Tamil is the default locale, so it carries the full weight and the
    // English translation sits just below it.
    priority:
      locale === DEFAULT_LOCALE
        ? route.priority
        : Math.max(0.1, Math.round((route.priority - 0.1) * 10) / 10),
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await dbConnect();

  const staticRoutes: Route[] = [
    { path: "", changeFrequency: "daily", priority: 1 },
    { path: "/lands", changeFrequency: "hourly", priority: 0.9 },
    { path: "/for-sale", changeFrequency: "daily", priority: 0.8 },
    { path: "/for-rent", changeFrequency: "daily", priority: 0.8 },
    { path: "/districts", changeFrequency: "weekly", priority: 0.7 },
    { path: "/about", changeFrequency: "monthly", priority: 0.4 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.1 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.1 },
    // /favourites is device-local and noindex — deliberately not listed.
  ];

  const [lands, districts] = await Promise.all([
    Land.find({ isPublished: true })
      .select("slug updatedAt")
      .sort({ updatedAt: -1 })
      .limit(5000)
      .lean(),
    District.find({ isActive: true }).select("slug updatedAt").lean(),
  ]);

  const landRoutes: Route[] = lands.map((l) => ({
    path: `/lands/${l.slug}`,
    lastModified: l.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const districtRoutes: Route[] = districts.map((d) => ({
    path: `/districts/${d.slug}`,
    lastModified: d.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...districtRoutes, ...landRoutes].flatMap(localized);
}
