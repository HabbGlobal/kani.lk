import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { HeroSearch } from "@/components/site/HeroSearch";
import { HeroWelcomeText } from "@/components/site/HeroWelcomeText";
import { LandRail } from "@/components/site/LandRail";
import { SectionHeading } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Logo } from "@/components/site/Logo";
import {
  getPopularLands,
  getFeaturedLands,
  getLatestLands,
  getRecentlySold,
  getDistrictsWithCounts,
  getTaxonomies,
  getSettings,
} from "@/lib/queries";
import { formatPhoneLocal, toE164 } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Land for sale and rent in Northern & Eastern Sri Lanka",
  description:
    "Browse land, paddy fields, coconut estates and houses across Vavuniya, Mannar, Jaffna, Mullaitivu, Trincomalee and Batticaloa. Contact owners directly on kani.lk.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [popular, featured, latest, sold, districts, taxonomies, settings] =
    await Promise.all([
      getPopularLands(8),
      getFeaturedLands(6),
      getLatestLands(8),
      getRecentlySold(6),
      getDistrictsWithCounts(),
      getTaxonomies(),
      getSettings(),
    ]);

  const totalListings = districts.reduce((sum, d) => sum + d.count, 0);
  const phone = String(settings.contactPhone ?? "");

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative isolate min-h-[56svh] overflow-hidden pb-12 pt-32 md:min-h-[52vh] md:pb-16 md:pt-40">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/banner-hero.webp"
            alt="Paddy fields and palmyra palms in the Vanni at first light"
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            quality={90}
            className="object-cover object-center"
          />
          {/* Scrim only where text actually sits: a band behind the navbar and
              headline, and a soft floor under the search panel. The middle of
              the photograph is left alone so it still reads as a photograph. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-[var(--kani-green-deep)]/60 via-[var(--kani-green-deep)]/12 via-45% to-[var(--kani-green-deep)]/45"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--bone)] to-transparent"
          />
        </div>

        <div className="container-kani on-dark">
          <div className="max-w-3xl animate-rise">
            <p className="mb-4 inline-flex max-w-full items-center gap-2 rounded-[var(--radius-pill)]
                          border border-white/25 bg-white/12 px-4 py-1.5 text-[13px] sm:text-[14px]
                          font-medium text-white backdrop-blur-sm">
              <span className="size-1.5 shrink-0 rounded-full bg-[var(--palmyra-gold)]" aria-hidden="true" />
              <span className="truncate">
                {totalListings} lands listed across {districts.length} districts
              </span>
            </p>

            <HeroWelcomeText
              title={String(settings.heroTitle)}
              subtitle={String(settings.heroSubtitle)}
            />
          </div>

          <div
            className="mt-8 animate-rise md:mt-10"
            style={{ animationDelay: "120ms" }}
          >
            <HeroSearch
              districts={taxonomies.districts}
              landTypes={taxonomies.landTypes}
            />
          </div>
        </div>
      </section>

      {/* ── Popular ──────────────────────────────────────────────────── */}
      {popular.length > 0 && (
        <section className="container-kani pt-16 md:pt-20">
          <Reveal>
            <SectionHeading
              title={String(settings.popularSectionTitle || "Most popular lands")}
              subtitle="The blocks people are looking at and calling about right now."
              action={
                <ButtonLink href="/lands" variant="outline" size="sm" className="hidden sm:inline-flex">
                  View all
                </ButtonLink>
              }
            />
          </Reveal>
          <LandRail lands={popular} priority />
        </section>
      )}

      {/* ── Featured ─────────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="mt-20 bg-[var(--kani-green)] py-16 text-white on-dark md:py-20">
          <div className="container-kani">
            <Reveal>
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-[27px] text-white md:text-[34px]">
                    Featured this month
                  </h2>
                  <p className="mt-1.5 max-w-2xl text-[15px] text-white/75 md:text-[16px]">
                    Hand-picked blocks — premium locations, or owners who need to move quickly.
                  </p>
                </div>
                <ButtonLink
                  href="/lands"
                  variant="light"
                  size="sm"
                  className="hidden shrink-0 sm:inline-flex"
                >
                  Browse all land
                </ButtonLink>
              </div>
            </Reveal>
            <LandRail lands={featured} />
          </div>
        </section>
      )}

      {/* ── Latest ───────────────────────────────────────────────────── */}
      {latest.length > 0 && (
        <section className="container-kani pt-16 md:pt-20">
          <Reveal>
            <SectionHeading
              title="Latest listings"
              subtitle="Newly published land and property, most recent first."
              action={
                <ButtonLink href="/lands?sort=newest" variant="outline" size="sm" className="hidden sm:inline-flex">
                  See all
                </ButtonLink>
              }
            />
          </Reveal>
          <LandRail lands={latest} />
        </section>
      )}

      {/* ── Districts ────────────────────────────────────────────────── */}
      <section className="container-kani pt-16 md:pt-20">
        <Reveal>
          <SectionHeading
            title="Browse by district"
            subtitle="Six districts across the Northern and Eastern provinces."
          />
        </Reveal>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {districts.map((d, i) => (
            <Reveal as="li" key={d._id} delay={Math.min(i * 55, 220)}>
              <Link
                href={`/districts/${d.slug}`}
                className="group flex h-full items-center justify-between gap-4 rounded-[var(--radius-lg)]
                           border border-[var(--hairline)] bg-[var(--card)] p-5 lift"
              >
                <span className="min-w-0">
                  <span className="block font-serif text-[21px] text-[var(--kani-green)]">
                    {d.name}
                  </span>
                  <span className="block text-[14px] text-[var(--muted)]">
                    {d.count} {d.count === 1 ? "listing" : "listings"} · {d.province} Province
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--kani-green)]/8
                             text-[var(--kani-green)] transition-transform duration-200
                             [transition-timing-function:var(--ease-out)] group-hover:translate-x-1"
                >
                  <svg viewBox="0 0 16 16" className="size-4" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6"
                          strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* ── Recently sold ────────────────────────────────────────────── */}
      {settings.showSoldRow && sold.length > 0 && (
        <section className="container-kani pt-16 md:pt-20">
          <Reveal>
            <SectionHeading
              title="Recently sold and rented"
              subtitle="Land that moved through kani.lk. Proof the market here is active."
            />
          </Reveal>
          <LandRail lands={sold} />
        </section>
      )}

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section className="container-kani pt-16 md:pt-20">
        <Reveal>
          <SectionHeading
            title="How kani.lk works"
            subtitle="No account, no commission, no middleman."
          />
        </Reveal>
        <ol className="grid gap-4 md:grid-cols-3">
          {[
            {
              n: "1",
              title: "Search the way you buy",
              body: "Filter by district, size in perches, price per perch, deed type and road access — the things that actually decide a purchase here.",
            },
            {
              n: "2",
              title: "See the whole block",
              body: "Every listing carries full photographs, the deed type, the access road width and the distance from town. Save what you like with the heart.",
            },
            {
              n: "3",
              title: "Call the owner directly",
              body: "The owner's own number is on every listing. Call, WhatsApp, or send an enquiry and they will come back to you.",
            },
          ].map((step, i) => (
            <Reveal as="li" key={step.n} delay={i * 70}>
              <div className="h-full rounded-[var(--radius-lg)] border border-[var(--hairline)] bg-[var(--card)] p-6">
                <span
                  className="mb-4 grid size-11 place-items-center rounded-full bg-[var(--kani-green)]
                             font-serif text-[19px] text-white"
                  aria-hidden="true"
                >
                  {step.n}
                </span>
                <h3 className="mb-2 text-[21px] text-[var(--kani-green)]">{step.title}</h3>
                <p className="text-[15px] leading-relaxed text-[var(--muted)]">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* ── Contact strip ────────────────────────────────────────────── */}
      <section className="container-kani pt-16 md:pt-20">
        <Reveal>
          <div className="overflow-hidden rounded-[var(--radius-xl)] bg-[var(--kani-green-deep)] px-6 py-12 text-center on-dark md:px-12 md:py-16">
            <Logo onDark className="mb-5 justify-center" />
            <h2 className="mx-auto max-w-2xl text-[27px] text-white md:text-[34px]">
              Have land to sell or rent out?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[16px] leading-relaxed text-white/75 md:text-[17px]">
              Send us the details and photographs and we will put it in front of
              buyers across the North and East. Listing on kani.lk is simple and
              we will talk you through it.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              {phone && (
                <a
                  href={`tel:${toE164(phone)}`}
                  className="tabular inline-flex h-14 items-center justify-center gap-2.5 rounded-[var(--radius-pill)]
                             bg-[var(--palmyra-gold)] px-8 text-[17px] font-semibold text-[var(--kani-green-deep)]
                             transition-[background-color,transform] duration-200
                             [transition-timing-function:var(--ease-out)]
                             hover:bg-[#cfae63] active:scale-[0.97]"
                >
                  <svg viewBox="0 0 20 20" className="size-5" fill="none" aria-hidden="true">
                    <path d="M4.2 3h3l1.4 3.6L6.9 8.2a10 10 0 0 0 4.9 4.9l1.6-1.7L17 12.8v3a1.2 1.2 0 0 1-1.3 1.2A13.5 13.5 0 0 1 3 4.3 1.2 1.2 0 0 1 4.2 3Z"
                          stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                  </svg>
                  {formatPhoneLocal(phone)}
                </a>
              )}
              <ButtonLink href="/contact" variant="light" size="lg">
                Send us a message
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </section>

      <OrganizationJsonLd phone={phone} email={String(settings.contactEmail ?? "")} />
    </>
  );
}

/** Organization schema, once per site, on the homepage. */
function OrganizationJsonLd({ phone, email }: { phone: string; email: string }) {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kani.lk";
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${site}/#organization`,
    name: "kani.lk",
    url: site,
    logo: `${site}/logo.png`,
    slogan: "Find. Invest. Own.",
    areaServed: [
      "Vavuniya", "Mannar", "Jaffna", "Mullaitivu", "Trincomalee", "Batticaloa",
    ],
    ...(phone ? { telephone: phone } : {}),
    ...(email ? { email } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
