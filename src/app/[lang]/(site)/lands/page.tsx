import type { Metadata } from "next";
import Link from "next/link";
import { LandGrid } from "@/components/site/LandRail";
import { FilterPanel } from "@/components/land/FilterPanel";
import { FilterChips } from "@/components/land/FilterChips";
import { LandsPageHeader } from "@/components/land/LandsPageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/Card";
import { searchLands, countLands, getTaxonomies } from "@/lib/queries";
import { parseFilters, buildQuery, type RawParams } from "@/lib/search-params";
import { getDictionary, interpolate, type Dictionary } from "@/lib/i18n";
import { localeHref, toLocale, type Locale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  const d = getDictionary(locale);

  return {
    title: d.lands.metaTitle,
    description: d.lands.metaDescription,
    alternates: {
      canonical: `/${locale}/lands`,
      languages: { "ta-LK": "/ta/lands", "en-LK": "/en/lands" },
    },
  };
}

export default async function LandsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<RawParams>;
}) {
  const locale = toLocale((await params).lang);
  const d = getDictionary(locale);
  const filters = parseFilters(await searchParams);

  const [result, taxonomies] = await Promise.all([
    searchLands(filters),
    getTaxonomies(),
  ]);

  return (
    <div className="container-kani py-8 md:py-12">
      <LandsPageHeader title={d.lands.pageTitle} />

      <div className="mb-4 text-center text-[15px] text-[var(--muted)]">
        {result.total === 0
          ? d.lands.noneMatch
          : result.total === 1
            ? d.lands.countLineOne
            : interpolate(d.lands.countLine, { count: result.total })}
      </div>

      {/* No lg:items-start here — position: sticky needs its containing block
          (this grid cell) to stay as tall as the results column, or it runs
          out of room to stick almost immediately. Default stretch keeps
          both columns full height while the aside itself stays fixed via
          its own `sticky` + `self-start`. */}
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div>
          <h2 className="mb-3 hidden text-[15px] font-semibold text-[var(--ink)] lg:block">
            {d.lands.filters}
          </h2>
          <FilterPanel
            districts={taxonomies.districts}
            cities={taxonomies.cities}
            landTypes={taxonomies.landTypes}
            resultCount={result.total}
          />
        </div>

        <div>
          <div className="mb-5">
            <FilterChips
              districts={taxonomies.districts}
              cities={taxonomies.cities}
              landTypes={taxonomies.landTypes}
            />
          </div>

          {result.items.length > 0 ? (
            <>
              <LandGrid lands={result.items} locale={locale} />
              <Pagination
                locale={locale}
                page={result.page}
                pages={result.pages}
                buildHref={(p) =>
                  `${localeHref("/lands", locale)}${buildQuery(filters, { page: p })}`
                }
              />
            </>
          ) : (
            <RelaxedEmptyState filters={filters} locale={locale} d={d} />
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * The empty state offers the nearest relaxation rather than an apology —
 * "6 in Vavuniya district →" is a route forward; "no results" is a dead end.
 */
async function RelaxedEmptyState({
  filters,
  locale,
  d,
}: {
  filters: ReturnType<typeof parseFilters>;
  locale: Locale;
  d: Dictionary;
}) {
  // Try dropping the most restrictive filter first, in rough order of how much
  // each one narrows a search here.
  const relaxations: { label: string; drop: Partial<typeof filters> }[] = [];

  if (filters.city) {
    relaxations.push({ label: d.lands.relaxCity, drop: { city: undefined } });
  }
  if (filters.minPerch || filters.maxPerch) {
    relaxations.push({
      label: d.lands.relaxSize,
      drop: { minPerch: undefined, maxPerch: undefined },
    });
  }
  if (filters.minPrice || filters.maxPrice) {
    relaxations.push({
      label: d.lands.relaxPrice,
      drop: { minPrice: undefined, maxPrice: undefined },
    });
  }
  if (filters.landType) {
    relaxations.push({ label: d.lands.relaxLandType, drop: { landType: undefined } });
  }
  if (filters.district) {
    relaxations.push({
      label: d.lands.relaxDistrict,
      drop: { district: undefined, city: undefined },
    });
  }

  const suggestions = (
    await Promise.all(
      relaxations.map(async (r) => {
        const relaxed = { ...filters, ...r.drop };
        const count = await countLands(relaxed);
        return count > 0 ? { ...r, count, relaxed } : null;
      })
    )
  ).filter(Boolean).slice(0, 3) as {
    label: string;
    count: number;
    relaxed: typeof filters;
  }[];

  return (
    <EmptyState title={d.lands.emptyTitle}>
      {suggestions.length > 0 ? (
        <div className="space-y-3">
          <p>{d.lands.tryWidening}</p>
          <ul className="space-y-2">
            {suggestions.map((s) => (
              <li key={s.label}>
                <Link
                  href={`${localeHref("/lands", locale)}${buildQuery(s.relaxed, { page: 1 })}`}
                  className="inline-flex items-center gap-1.5 font-medium text-[var(--kani-green)]
                             underline-offset-4 hover:underline"
                >
                  {interpolate(
                    s.count === 1 ? d.lands.suggestionOne : d.lands.suggestion,
                    { count: s.count, label: s.label }
                  )}
                  <svg viewBox="0 0 16 16" className="size-3.5" fill="none" aria-hidden="true">
                    <path d="M3 8h9M8 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6"
                          strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>{d.lands.emptyFallback}</p>
      )}
    </EmptyState>
  );
}
