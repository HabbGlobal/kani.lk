import Link from "next/link";
import { LandGrid } from "./LandRail";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { searchLands, getDistrictsWithCounts } from "@/lib/queries";
import { parseFilters, buildQuery, type RawParams } from "@/lib/search-params";
import type { Purpose } from "@/models/types";

/**
 * Shared body for /for-sale and /for-rent. These carry real intro copy because
 * they rank for the searches that actually convert.
 */
export async function PurposeLanding({
  purpose,
  searchParams,
  title,
  intro,
}: {
  purpose: Purpose;
  searchParams: RawParams;
  title: string;
  intro: string;
}) {
  const base = parseFilters(searchParams);
  const filters = { ...base, purpose };

  const [result, districts] = await Promise.all([
    searchLands(filters),
    getDistrictsWithCounts(),
  ]);

  const path = purpose === "sale" ? "/for-sale" : "/for-rent";

  return (
    <div className="container-kani py-8 md:py-12">
      <header className="mb-8 max-w-3xl">
        <h1 className="text-[27px] text-[var(--kani-green)] md:text-[34px]">{title}</h1>
        <p className="mt-1.5 text-[16px] text-[var(--muted)]">
          {result.total} {result.total === 1 ? "listing" : "listings"} available now
        </p>
        <p className="mt-4 text-[17px] leading-relaxed text-[var(--ink)]">{intro}</p>
      </header>

      {/* District shortcuts double as internal links for crawlers. */}
      <nav aria-label="Filter by district" className="mb-8">
        <ul className="flex flex-wrap gap-2">
          {districts
            .filter((d) => d.count > 0)
            .map((d) => (
              <li key={d._id}>
                <Link
                  href={`${path}?district=${d.slug}`}
                  className="inline-flex h-10 items-center gap-1.5 rounded-[var(--radius-pill)]
                             border border-[var(--hairline)] bg-[var(--card)] px-4 text-[15px]
                             text-[var(--ink)] transition-colors duration-200
                             hover:border-[var(--kani-green)]/40 hover:text-[var(--kani-green)]"
                >
                  {d.name}
                  <span className="tabular text-[13px] text-[var(--muted)]">{d.count}</span>
                </Link>
              </li>
            ))}
        </ul>
      </nav>

      {result.items.length > 0 ? (
        <>
          <LandGrid lands={result.items} />
          <Pagination
            page={result.page}
            pages={result.pages}
            buildHref={(p) =>
              `${path}${buildQuery({ ...filters, purpose: undefined }, { page: p })}`
            }
          />
        </>
      ) : (
        <EmptyState
          title="Nothing listed here right now"
          action={<ButtonLink href="/lands">Browse everything</ButtonLink>}
        >
          <p>New land is added every week. Try a wider search.</p>
        </EmptyState>
      )}
    </div>
  );
}
