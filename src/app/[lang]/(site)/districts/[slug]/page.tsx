import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { LandGrid } from "@/components/site/LandRail";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { getDistrictBySlug, searchLands, getDistrictsWithCounts } from "@/lib/queries";
import { parseFilters, buildQuery, type RawParams } from "@/lib/search-params";
import { truncate } from "@/lib/utils";
import { getDictionary, interpolate } from "@/lib/i18n";
import { localeHref, toLocale } from "@/lib/i18n/config";
import { localizedName } from "@/lib/i18n/localized";

export const revalidate = 300;

type Params = {
  params: Promise<{ slug: string; lang: string }>;
  searchParams: Promise<RawParams>;
};

/** District pages are SEO gold — "Land for sale in Jaffna" is the real query. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; lang: string }>;
}): Promise<Metadata> {
  const { slug, lang } = await params;
  const locale = toLocale(lang);
  const d = getDictionary(locale);
  const district = await getDistrictBySlug(slug);
  if (!district) return { title: d.districts.notFound };

  const name = localizedName(district, locale);
  // The Tamil intro when there is one, so the description matches the page.
  const intro = locale === "ta" && district.introTa?.trim() ? district.introTa : district.intro;

  return {
    title: interpolate(d.districts.detailMetaTitle, { name }),
    description: intro
      ? truncate(intro, 155)
      : interpolate(d.districts.detailMetaDescription, { name }),
    alternates: {
      canonical: `/${locale}/districts/${district.slug}`,
      languages: {
        "ta-LK": `/ta/districts/${district.slug}`,
        "en-LK": `/en/districts/${district.slug}`,
      },
    },
  };
}

/** Pre-render all districts in both locales — six each, and they change rarely. */
export async function generateStaticParams() {
  const districts = await getDistrictsWithCounts();
  return districts.flatMap((district) =>
    ["ta", "en"].map((lang) => ({ lang, slug: district.slug }))
  );
}

export default async function DistrictPage({ params, searchParams }: Params) {
  const [{ slug, lang }, rawParams] = await Promise.all([params, searchParams]);
  const locale = toLocale(lang);
  const d = getDictionary(locale);

  const district = await getDistrictBySlug(slug);
  if (!district) notFound();

  // The district is fixed by the route; everything else still comes from the URL.
  const filters = { ...parseFilters(rawParams), district: slug };
  const result = await searchLands(filters);

  const name = localizedName(district, locale);
  const introTa = district.introTa?.trim();
  const intro = locale === "ta" && introTa ? introTa : district.intro;
  const introIsFallback = locale === "ta" && !introTa && Boolean(district.intro);

  return (
    <div className="container-kani py-8 md:py-12">
      <nav aria-label={d.land.breadcrumb} className="mb-4">
        <ol className="flex items-center gap-1.5 text-[14px] text-[var(--muted)]">
          <li className="flex items-center gap-1.5">
            <Link href={localeHref("/", locale)} className="hover:text-[var(--kani-green)]">
              {d.land.breadcrumbHome}
            </Link>
            <span aria-hidden="true">/</span>
          </li>
          <li className="flex items-center gap-1.5">
            <Link
              href={localeHref("/districts", locale)}
              className="hover:text-[var(--kani-green)]"
            >
              {d.nav.districts}
            </Link>
            <span aria-hidden="true">/</span>
          </li>
          <li className="text-[var(--ink)]" aria-current="page">{name}</li>
        </ol>
      </nav>

      <header className="mb-8 max-w-3xl">
        <h1 className="text-[27px] text-[var(--kani-green)] md:text-[34px]">
          {interpolate(d.districts.detailTitle, { name })}
        </h1>
        <p className="mt-1.5 text-[16px] text-[var(--muted)]">
          {interpolate(
            result.total === 1 ? d.districts.detailCountOne : d.districts.detailCount,
            { count: result.total, name, province: district.province }
          )}
        </p>
        {/* Real intro copy — this is what ranks for the searches that matter. */}
        {intro && (
          <div
            className="prose-kani mt-4 text-[17px] leading-relaxed text-[var(--ink)]"
            lang={introIsFallback ? "en" : undefined}
          >
            {intro.split(/\n\s*\n/).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        )}
      </header>

      {result.items.length > 0 ? (
        <>
          <LandGrid lands={result.items} locale={locale} />
          <Pagination
            locale={locale}
            page={result.page}
            pages={result.pages}
            buildHref={(p) =>
              `${localeHref(`/districts/${slug}`, locale)}${buildQuery(
                { ...filters, district: undefined },
                { page: p }
              )}`
            }
          />
        </>
      ) : (
        <EmptyState
          title={interpolate(d.districts.emptyTitle, { name })}
          action={
            <ButtonLink href={localeHref("/lands", locale)} variant="primary">
              {d.districts.emptyCta}
            </ButtonLink>
          }
        >
          <p>{interpolate(d.districts.emptyBody, { name })}</p>
        </EmptyState>
      )}
    </div>
  );
}
