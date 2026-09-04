import type { Metadata } from "next";
import Link from "next/link";
import { getDistrictsWithCounts } from "@/lib/queries";
import { truncate } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Land by district — Northern and Eastern provinces",
  description:
    "Browse land and property by district across Vavuniya, Mannar, Jaffna, Mullaitivu, Trincomalee and Batticaloa.",
  alternates: { canonical: "/districts" },
};

export default async function DistrictsPage() {
  const districts = await getDistrictsWithCounts();

  return (
    <div className="container-kani py-8 md:py-12">
      <header className="mb-8 max-w-3xl">
        <h1 className="text-[27px] text-[var(--kani-green)] md:text-[34px]">
          Land by district
        </h1>
        <p className="mt-2 text-[17px] leading-relaxed text-[var(--muted)]">
          Every district in the Northern and Eastern provinces where we list
          land. Prices, plot sizes and what buyers look for differ sharply
          between them.
        </p>
      </header>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {districts.map((d, i) => (
          <Reveal as="li" key={d._id} delay={Math.min(i * 55, 220)}>
            <Link
              href={`/districts/${d.slug}`}
              className="group flex h-full flex-col rounded-[var(--radius-lg)] border
                         border-[var(--hairline)] bg-[var(--card)] p-6 lift"
            >
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <h2 className="font-serif text-[24px] text-[var(--kani-green)]">
                  {d.name}
                </h2>
                <span className="tabular shrink-0 rounded-[var(--radius-pill)] bg-[var(--kani-green)]/10
                                 px-2.5 py-1 text-[13px] font-semibold text-[var(--kani-green)]">
                  {d.count}
                </span>
              </div>
              <p className="mb-3 text-[14px] text-[var(--muted)]">
                {d.province} Province
              </p>
              {d.intro && (
                <p className="text-[15px] leading-relaxed text-[var(--ink)]">
                  {truncate(d.intro, 150)}
                </p>
              )}
              <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[15px]
                               font-medium text-[var(--kani-green)]">
                Browse {d.name}
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
