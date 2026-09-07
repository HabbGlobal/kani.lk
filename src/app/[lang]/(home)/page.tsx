import Link from "next/link";
import type { Metadata } from "next";
import { HeroSearch } from "@/components/site/HeroSearch";
import { HeroSlideshow } from "@/components/site/HeroSlideshow";
import { HeroStats } from "@/components/site/HeroStats";
import { HeroWelcomeText } from "@/components/site/HeroWelcomeText";
import { LandRail } from "@/components/site/LandRail";
import { ListLandCta } from "@/components/site/ListLandCta";
import { SectionHeading } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import {
  getPopularLands,
  getFeaturedLands,
  getLatestLands,
  getRecentlySold,
  getDistrictsWithCounts,
  getTaxonomies,
  getSettings,
} from "@/lib/queries";
import { getDictionary, interpolate } from "@/lib/i18n";
import { localeHref, toLocale, type Locale } from "@/lib/i18n/config";
import { localizedName } from "@/lib/i18n/localized";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const locale = toLocale((await params).lang);

  const copy: Record<Locale, { title: string; description: string }> = {
    en: {
      title: "Land for sale and rent in Northern & Eastern Sri Lanka",
      description:
        "Browse land, paddy fields, coconut estates and houses across Vavuniya, Mannar, Jaffna, Mullaitivu, Trincomalee and Batticaloa. Contact owners directly on kani.lk.",
    },
    ta: {
      title: "இலங்கையின் வட, கிழக்கு மாகாணங்களில் விற்பனைக்கும் வாடகைக்குமான காணிகள்",
      description:
        "வவுனியா, மன்னார், யாழ்ப்பாணம், முல்லைத்தீவு, திருகோணமலை, மட்டக்களப்பு ஆகிய மாவட்டங்களில் காணிகள், வயல்கள், தென்னந்தோட்டங்கள், வீடுகள். உரிமையாளர்களை நேரடியாகத் தொடர்பு கொள்ளுங்கள்.",
    },
  };

  return {
    ...copy[locale],
    alternates: {
      canonical: `/${locale}`,
      // Each locale is a real URL, so tell Google about both.
      languages: { "ta-LK": "/ta", "en-LK": "/en" },
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const locale = toLocale((await params).lang);
  const d = getDictionary(locale);
  const href = (path: string) => localeHref(path, locale);

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
  const whatsapp = String(settings.contactWhatsapp ?? "");

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────
          Three layers: this outer wrapper stays overflow-visible so the
          search panel below can overlap the media layer's bottom edge;
          the media layer (slideshow + scrims) is the only thing clipped;
          the search panel sits after it, pulled up with a negative margin
          so it's never inside the clipped layer. ────────────────────── */}
      <section className="kani-hero-shell relative isolate">
        <div
          className="kani-hero-media relative isolate overflow-hidden rounded-b-[28px]
                     [height:clamp(620px,78svh,760px)]
                     md:[height:clamp(560px,66vh,660px)]"
        >
          <HeroSlideshow />
          {/* Directional scrim: solid enough for text on the left, easing off
              so the land itself stays visible on the right. Pointer-events
              none throughout — purely decorative, never blocks the slider
              or any control drawn above it. */}
          <div
            aria-hidden="true"
            className="kani-hero-overlay pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "linear-gradient(90deg, rgba(4,12,9,0.62) 0%, rgba(4,12,9,0.42) 38%, rgba(4,12,9,0.14) 68%, rgba(4,12,9,0.04) 100%)",
            }}
          />
          {/* Band behind the floating navbar — the media layer now starts at
              the very top of the section (matches the original hero), so
              this keeps the wordmark/links readable over a bright slide. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40
                       bg-gradient-to-b from-[var(--kani-green-deep)]/55 to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-28
                       bg-gradient-to-t from-[var(--kani-green-deep)]/55 to-transparent"
          />

          <div className="kani-hero-content container-kani on-dark flex h-full flex-col justify-center pt-28 pb-16 md:pt-32 md:pb-20">
            <div className="max-w-[620px] animate-rise">
              <HeroWelcomeText
                title={String(settings.heroTitle)}
                subtitle={String(settings.heroSubtitle)}
              />

              <HeroStats
                listings={totalListings}
                districts={districts.length}
                categories={taxonomies.landTypes.length}
              />
            </div>
          </div>
        </div>

        {/* Search panel: normal document flow on mobile (overlap causes
            cramped stacking below ~640px), pulled up to overlap the media
            layer's bottom edge from sm upward. */}
        <div className="container-kani relative z-10 -mt-6 pb-10 sm:-mt-16 md:pb-4">
          <p className="mb-3 flex justify-center animate-rise">
            <span
              className="inline-flex max-w-full items-center gap-2 rounded-[var(--radius-pill)]
                         border border-[var(--palmyra-gold)]/40 bg-[var(--kani-green-deep)] px-4 py-1.5
                         text-[13px] font-medium text-white shadow-[0_6px_18px_-6px_rgba(10,44,30,0.45)]
                         sm:text-[14px]"
            >
              <span className="size-1.5 shrink-0 rounded-full bg-[var(--palmyra-gold)]" aria-hidden="true" />
              <span className="truncate">
                {interpolate(d.home.statBar, {
                  listings: totalListings,
                  districts: districts.length,
                })}
              </span>
            </span>
          </p>
          <div
            className="mt-8 animate-rise sm:mt-0"
            style={{ animationDelay: "160ms" }}
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
              title={String(settings.popularSectionTitle || d.home.popularTitle)}
              subtitle={d.home.popularSub}
              action={
                <ButtonLink href={href("/lands")} variant="outline" size="sm" className="hidden sm:inline-flex">
                  {d.home.viewAll}
                </ButtonLink>
              }
            />
          </Reveal>
          <LandRail lands={popular} locale={locale} priority />
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
                    {d.home.featuredTitle}
                  </h2>
                  <p className="mt-1.5 max-w-2xl text-[15px] text-white/75 md:text-[16px]">
                    {d.home.featuredSub}
                  </p>
                </div>
                <ButtonLink
                  href={href("/lands")}
                  variant="light"
                  size="sm"
                  className="hidden shrink-0 sm:inline-flex"
                >
                  {d.home.browseAllLand}
                </ButtonLink>
              </div>
            </Reveal>
            <LandRail lands={featured} locale={locale} />
          </div>
        </section>
      )}

      {/* ── Latest ───────────────────────────────────────────────────── */}
      {latest.length > 0 && (
        <section className="container-kani pt-16 md:pt-20">
          <Reveal>
            <SectionHeading
              title={d.home.latestTitle}
              subtitle={d.home.latestSub}
              action={
                <ButtonLink href={href("/lands?sort=newest")} variant="outline" size="sm" className="hidden sm:inline-flex">
                  {d.home.seeAll}
                </ButtonLink>
              }
            />
          </Reveal>
          <LandRail lands={latest} locale={locale} />
        </section>
      )}

      {/* ── Districts ────────────────────────────────────────────────── */}
      <section className="container-kani pt-16 md:pt-20">
        <Reveal>
          <SectionHeading
            title={d.home.districtsTitle}
            subtitle={d.home.districtsSub}
          />
        </Reveal>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {districts.map((district, i) => (
            <Reveal as="li" key={district._id} delay={Math.min(i * 55, 220)}>
              <Link
                href={href(`/districts/${district.slug}`)}
                className="group flex h-full items-center justify-between gap-4 rounded-[var(--radius-lg)]
                           border border-[var(--hairline)] bg-[var(--card)] p-5 lift"
              >
                <span className="min-w-0">
                  <span className="block font-serif text-[21px] text-[var(--kani-green)]">
                    {localizedName(district, locale)}
                  </span>
                  <span className="block text-[14px] text-[var(--muted)]">
                    {district.count}{" "}
                    {district.count === 1 ? d.home.listingOne : d.home.listingMany} ·{" "}
                    {district.province} {d.home.province}
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
              title={d.home.soldTitle}
              subtitle={d.home.soldSub}
            />
          </Reveal>
          <LandRail lands={sold} locale={locale} />
        </section>
      )}

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section id="how-it-works" className="container-kani scroll-mt-24 pt-16 md:pt-20">
        <Reveal>
          <SectionHeading
            title={d.home.howTitle}
            subtitle={d.home.howSub}
          />
        </Reveal>
        <ol className="grid gap-4 md:grid-cols-3">
          {[
            { n: "1", title: d.home.how1Title, body: d.home.how1Body },
            { n: "2", title: d.home.how2Title, body: d.home.how2Body },
            { n: "3", title: d.home.how3Title, body: d.home.how3Body },
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

      {/* ── List-your-land CTA ───────────────────────────────────────── */}
      <Reveal as="div">
        <ListLandCta whatsappNumber={whatsapp || phone} />
      </Reveal>

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
