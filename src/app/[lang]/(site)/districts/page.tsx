import type { Metadata } from "next";
import Link from "next/link";
import { getDistrictsWithCounts } from "@/lib/queries";
import { truncate } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";
import { getDictionary, interpolate } from "@/lib/i18n";
import { localeHref, toLocale } from "@/lib/i18n/config";
import { localizedName } from "@/lib/i18n/localized";

export const revalidate = 600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  const d = getDictionary(locale);

  return {
    title: d.districts.metaTitle,
    description: d.districts.metaDescription,
    alternates: {
      canonical: `/${locale}/districts`,
      languages: { "ta-LK": "/ta/districts", "en-LK": "/en/districts" },
    },
  };
}

export default async function DistrictsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const locale = toLocale((await params).lang);
  const d = getDictionary(locale);
  const districts = await getDistrictsWithCounts();

  return (
    <div className="container-kani py-8 md:py-12">
      <header className="mb-8 max-w-3xl">
        <h1 className="text-[27px] text-[var(--kani-green)] md:text-[34px]">
          {d.districts.title}
        </h1>
        <p className="mt-2 text-[17px] leading-relaxed text-[var(--muted)]">
          {d.districts.intro}
        </p>
      </header>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {districts.map((district, i) => (
          <Reveal as="li" key={district._id} delay={Math.min(i * 55, 220)}>
            <Link
              href={localeHref(`/districts/${district.slug}`, locale)}
              className="group flex h-full flex-col rounded-[var(--radius-lg)] border
                         border-[var(--hairline)] bg-[var(--card)] p-6 lift"
            >
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <h2 className="font-serif text-[24px] text-[var(--kani-green)]">
                  {localizedName(district, locale)}
                </h2>
                <span className="tabular shrink-0 rounded-[var(--radius-pill)] bg-[var(--kani-green)]/10
                                 px-2.5 py-1 text-[13px] font-semibold text-[var(--kani-green)]">
                  {district.count}
                </span>
              </div>
              <p className="mb-3 text-[14px] text-[var(--muted)]">
                {district.province} {d.districts.province}
              </p>
              {district.intro && (
                <p className="text-[15px] leading-relaxed text-[var(--ink)]">
                  {truncate(district.intro, 150)}
                </p>
              )}
              <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[15px]
                               font-medium text-[var(--kani-green)]">
                {interpolate(d.districts.browseDistrict, {
                  name: localizedName(district, locale),
                })}
                <svg viewBox="0 0 16 16" className="size-3.5 transition-transform duration-200
                                                    [transition-timing-function:var(--ease-out)]
                                                    group-hover:translate-x-1"
                     fill="none" aria-hidden="true">
                  <path d="M3 8h9M8 4l4 4-4 4" stroke="currentColor" strokeWidth="1.7"
                        strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}
