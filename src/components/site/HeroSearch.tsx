import Link from "next/link";
import { Select } from "@/components/ui/Field";

/**
 * The hero search. Deliberately a plain GET form to /lands with no JavaScript
 * at all — it works with JS disabled, on a slow connection, and before hydration.
 * Every control is a native element the browser already knows how to submit.
 */
export function HeroSearch({
  districts,
  landTypes,
}: {
  districts: { _id: string; name: string; slug: string }[];
  landTypes: { _id: string; name: string; slug: string }[];
}) {
  return (
    <form
      action="/lands"
      method="get"
      className="rounded-[var(--radius-xl)] border border-white/25 bg-white/12 p-3
                 shadow-[0_20px_60px_-20px_rgba(10,44,30,0.55)]
                 backdrop-blur-xl backdrop-saturate-150 sm:p-4"
    >
      <div className="rounded-[var(--radius-lg)] bg-[var(--bone)]/97 p-3 sm:p-4">
        {/* Purpose: real radios, styled as a segmented control. */}
        <fieldset className="mb-3">
          <legend className="sr-only">What are you looking for?</legend>
          <div className="flex rounded-[var(--radius-pill)] bg-black/[0.055] p-1">
            {[
              { value: "", label: "All" },
              { value: "sale", label: "For sale" },
              { value: "rent", label: "For rent" },
            ].map((opt, i) => (
              <label
                key={opt.label}
                className="flex-1 cursor-pointer rounded-[var(--radius-pill)] px-2 py-2.5 text-center
                           text-[15px] font-medium text-[var(--muted)]
                           transition-all duration-200 [transition-timing-function:var(--ease-out)]
                           hover:text-[var(--ink)]
                           has-[:checked]:bg-white has-[:checked]:text-[var(--kani-green)]
                           has-[:checked]:shadow-[0_1px_4px_rgba(10,44,30,0.14)]
                           has-[:focus-visible]:outline has-[:focus-visible]:outline-2
                           has-[:focus-visible]:outline-offset-2"
              >
                <input
                  type="radio"
                  name="purpose"
                  value={opt.value}
                  defaultChecked={i === 0}
                  className="sr-only"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-[1.2fr_1.2fr_1fr_1fr_auto]">
          <div>
            <label htmlFor="hero-district" className="sr-only">District</label>
            <Select id="hero-district" name="district" defaultValue="">
              <option value="">Any district</option>
              {districts.map((d) => (
                <option key={d._id} value={d.slug}>{d.name}</option>
              ))}
            </Select>
          </div>

          <div>
            <label htmlFor="hero-type" className="sr-only">Land type</label>
            <Select id="hero-type" name="landType" defaultValue="">
              <option value="">Any land type</option>
              {landTypes.map((t) => (
                <option key={t._id} value={t.slug}>{t.name}</option>
              ))}
            </Select>
          </div>

          <div>
            <label htmlFor="hero-min" className="sr-only">Minimum size in perches</label>
            <Select id="hero-min" name="minPerch" defaultValue="">
              <option value="">Min size</option>
              {[5, 10, 15, 20, 40, 80, 160].map((p) => (
                <option key={p} value={p}>{p}+ perches</option>
              ))}
            </Select>
          </div>

          <div>
            <label htmlFor="hero-max" className="sr-only">Maximum size in perches</label>
            <Select id="hero-max" name="maxPerch" defaultValue="">
              <option value="">Max size</option>
              {[10, 20, 40, 80, 160, 320, 800].map((p) => (
                <option key={p} value={p}>
                  {p >= 160 ? `${p / 160} acres` : `${p} perches`}
                </option>
              ))}
            </Select>
          </div>

          <button
            type="submit"
            className="inline-flex h-12 cursor-pointer items-center justify-center gap-2
                       rounded-[var(--radius-pill)] bg-[var(--kani-green)] px-7 text-[16px] font-medium text-white
                       transition-[background-color,transform] duration-200
                       [transition-timing-function:var(--ease-out)]
                       hover:bg-[var(--kani-green-deep)] active:scale-[0.97]
                       focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <svg viewBox="0 0 20 20" className="size-4.5" fill="none" aria-hidden="true">
              <circle cx="8.75" cy="8.75" r="5.75" stroke="currentColor" strokeWidth="1.8" />
              <path d="M13 13l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Search
          </button>
        </div>

        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] text-[var(--muted)]">
          <span>Popular:</span>
          {[
            { label: "Land in Vavuniya", href: "/districts/vavuniya" },
            { label: "Paddy land", href: "/lands?landType=paddy-land" },
            { label: "Under 20 perches", href: "/lands?maxPerch=20" },
            { label: "Houses for rent", href: "/lands?purpose=rent&landType=house-and-land" },
          ].map((chip) => (
            <Link
              key={chip.label}
              href={chip.href}
              className="rounded-[var(--radius-pill)] bg-black/[0.045] px-2.5 py-1 text-[var(--ink)]
                         transition-colors hover:bg-[var(--kani-green)]/10 hover:text-[var(--kani-green)]"
            >
              {chip.label}
            </Link>
          ))}
        </p>
      </div>
    </form>
  );
}
