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

export const revalidate = 300;

type Params = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawParams>;
};

/** District pages are SEO gold — "Land for sale in Jaffna" is the real query. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const district = await getDistrictBySlug(slug);
  if (!district) return { title: "District not found" };

  return {
    title: `Land for sale and rent in ${district.name}`,
    description: district.intro
      ? truncate(district.intro, 155)
      : `Browse land, paddy, coconut estates and houses for sale or rent in ${district.name} district, Sri Lanka.`,
    alternates: { canonical: `/districts/${district.slug}` },
  };
}

/** Pre-render all districts — there are six, and they change rarely. */
export async function generateStaticParams() {
  const districts = await getDistrictsWithCounts();
  return districts.map((d) => ({ slug: d.slug }));
}

export default async function DistrictPage({ params, searchParams }: Params) {
  const [{ slug }, rawParams] = await Promise.all([params, searchParams]);

  const district = await getDistrictBySlug(slug);
  if (!district) notFound();

  // The district is fixed by the route; everything else still comes from the URL.
  const filters = { ...parseFilters(rawParams), district: slug };
  const result = await searchLands(filters);

  return (
    <div className="container-kani py-8 md:py-12">
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex items-center gap-1.5 text-[14px] text-[var(--muted)]">
          <li className="flex items-center gap-1.5">
            <Link href="/" className="hover:text-[var(--kani-green)]">Home</Link>
            <span aria-hidden="true">/</span>
          </li>
          <li className="flex items-center gap-1.5">
            <Link href="/districts" className="hover:text-[var(--kani-green)]">Districts</Link>
            <span aria-hidden="true">/</span>
          </li>
          <li className="text-[var(--ink)]" aria-current="page">{district.name}</li>
        </ol>
      </nav>

      <header className="mb-8 max-w-3xl">
        <h1 className="text-[27px] text-[var(--kani-green)] md:text-[34px]">
          Land for sale and rent in {district.name}
        </h1>
        <p className="mt-1.5 text-[16px] text-[var(--muted)]">
          {result.total} {result.total === 1 ? "listing" : "listings"} in{" "}
          {district.name} district, {district.province} Province
        </p>
        {/* Real intro copy — this is what ranks for the searches that matter. */}
        {district.intro && (
          <div className="prose-kani mt-4 text-[17px] leading-relaxed text-[var(--ink)]">
            {district.intro.split(/\n\s*\n/).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        )}
      </header>

      {result.items.length > 0 ? (
        <>
          <LandGrid lands={result.items} />
          <Pagination
            page={result.page}
            pages={result.pages}
            buildHref={(p) => `/districts/${slug}${buildQuery({ ...filters, district: undefined }, { page: p })}`}
          />
        </>
      ) : (
        <EmptyState
          title={`Nothing listed in ${district.name} right now`}
          action={
            <ButtonLink href="/lands" variant="primary">
              Browse all districts
            </ButtonLink>
          }
        >
          <p>
            New land is added every week. Try another district, or call us and
            tell us what you are looking for in {district.name}.
          </p>
        </EmptyState>
      )}
    </div>
  );
}
