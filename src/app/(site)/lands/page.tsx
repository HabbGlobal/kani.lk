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

export const metadata: Metadata = {
  title: "Browse land for sale and rent",
  description:
    "Search land, paddy, coconut estates and houses across the Northern and Eastern provinces by district, size in perches, price and deed type.",
  alternates: { canonical: "/lands" },
};

export default async function LandsPage({
  searchParams,
}: {
  searchParams: Promise<RawParams>;
}) {
  const params = await searchParams;
  const filters = parseFilters(params);

  const [result, taxonomies] = await Promise.all([
    searchLands(filters),
    getTaxonomies(),
  ]);

  return (
    <div className="container-kani py-8 md:py-12">
      <LandsPageHeader title="Land and property" />

      <div className="mb-4 text-center text-[15px] text-[var(--muted)]">
        {result.total === 0
          ? "No listings match these filters"
          : `${result.total} ${result.total === 1 ? "listing" : "listings"} across the North and East`}
      </div>

      {/* No lg:items-start here — position: sticky needs its containing block
          (this grid cell) to stay as tall as the results column, or it runs
          out of room to stick almost immediately. Default stretch keeps
          both columns full height while the aside itself stays fixed via
          its own `sticky` + `self-start`. */}
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div>
          <h2 className="mb-3 hidden text-[15px] font-semibold text-[var(--ink)] lg:block">
            Filters
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
              <LandGrid lands={result.items} />
              <Pagination
                page={result.page}
                pages={result.pages}
                buildHref={(p) => `/lands${buildQuery(filters, { page: p })}`}
              />
            </>
          ) : (
            <RelaxedEmptyState filters={filters} />
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
}: {
  filters: ReturnType<typeof parseFilters>;
}) {
  // Try dropping the most restrictive filter first, in rough order of how much
  // each one narrows a search here.
  const relaxations: { label: string; drop: Partial<typeof filters> }[] = [];

  if (filters.city) {
    relaxations.push({ label: "anywhere in the district", drop: { city: undefined } });
  }
  if (filters.minPerch || filters.maxPerch) {
    relaxations.push({
      label: "any size",
      drop: { minPerch: undefined, maxPerch: undefined },
    });
  }
  if (filters.minPrice || filters.maxPrice) {
    relaxations.push({
      label: "any price",
      drop: { minPrice: undefined, maxPrice: undefined },
    });
  }
  if (filters.landType) {
    relaxations.push({ label: "any land type", drop: { landType: undefined } });
  }
  if (filters.district) {
    relaxations.push({ label: "all districts", drop: { district: undefined, city: undefined } });
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
    <EmptyState title="Nothing matches these filters yet">
      {suggestions.length > 0 ? (
        <div className="space-y-3">
          <p>Try widening the search:</p>
          <ul className="space-y-2">
            {suggestions.map((s) => (
              <li key={s.label}>
                <Link
                  href={`/lands${buildQuery(s.relaxed, { page: 1 })}`}
                  className="inline-flex items-center gap-1.5 font-medium text-[var(--kani-green)]
                             underline-offset-4 hover:underline"
                >
                  {s.count} {s.count === 1 ? "listing" : "listings"} with {s.label}
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
        <p>
          Nothing is listed against these filters right now. New land is added
          every week — try a wider search, or call us and tell us what you are
          looking for.
        </p>
      )}
    </EmptyState>
  );
}
