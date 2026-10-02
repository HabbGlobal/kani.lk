import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { HeroSearch } from "@/components/site/HeroSearch";
import { HeroSlideshow } from "@/components/site/HeroSlideshow";
import { HeroStats } from "@/components/site/HeroStats";
import { HeroWelcomeText } from "@/components/site/HeroWelcomeText";
import { HeroPublishCta } from "@/components/site/HeroPublishCta";
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
import { localizedName, localizedHero } from "@/lib/i18n/localized";

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
      getPopularLands(4),
      getFeaturedLands(4),
      getLatestLands(8),
      getRecentlySold(6),
      getDistrictsWithCounts(),
      getTaxonomies(),
      getSettings(),
    ]);

  const totalListings = districts.reduce((sum, d) => sum + d.count, 0);
  const phone = String(settings.contactPhone ?? "");
  const whatsapp = String(settings.contactWhatsapp ?? "");
  const hero = localizedHero(settings as Record<string, string>, locale);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────
          Three layers: this outer wrapper stays overflow-visible so the
          search panel below can overlap the media layer's bottom edge;
          the media layer (slideshow + scrims) is the only thing clipped;
          the search panel sits after it, pulled up with a negative margin
          so it's never inside the clipped layer. ────────────────────── */}
      <section className="kani-hero-shell relative isolate">
        <div className="kani-hero-media relative isolate min-h-[100svh] overflow-hidden rounded-b-[28px] [min-height:max(620px,100svh)] md:[min-height:max(680px,100svh)]">
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

          <HeroPublishCta phone={phone} locale={locale} />

          <div className="kani-hero-content container-kani on-dark flex min-h-full flex-col justify-center pt-28 pb-16 md:pt-32 md:pb-20">
            {/* Both locales share the wider measure — it holds the headline on
                two lines in English and five in Tamil without overflowing. */}
            <div className="animate-rise max-w-[760px]">
              <HeroWelcomeText
                title={hero.title}
                subtitle={hero.subtitle}
                locale={locale}
              />

              {/* English's shorter headline/description leaves more empty
                  photo below the centered content block than Tamil's does
                  on mobile, so the stats + card sat high with a lot of bare
                  space underneath. Extra top margin here, English-mobile
                  only, moves the block down into that space instead of
                  changing the block's centering (which both locales share
                  and which already reads well for Tamil). */}
              <div className={locale === "en" ? "mt-10 sm:mt-0" : undefined}>
                <HeroStats
                  listings={totalListings}
                  districts={districts.length}
                  categories={taxonomies.landTypes.length}
                  locale={locale}
                />

                {/* Compact mobile-only counterpart to the floating card below
                    (`sm` and up) — normal document flow, directly beneath the
                    stats, auto height. See HeroPublishCta.tsx for why this
                    isn't just a breakpoint variant of the same markup. */}
                <div className="mt-4 sm:hidden">
                  <HeroPublishCta.Compact phone={phone} locale={locale} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search panel: normal document flow on mobile (overlap causes
            cramped stacking below ~640px), pulled up to overlap the media
            layer's bottom edge from sm upward. The stat line now renders
            inside the card itself, inline with the purpose tabs — it used to
            float above the card as its own pill and overlapped the hero's
            bottom edge. */}
        <div
          className={`container-kani relative z-10 pb-10 md:pb-4 ${
            locale === "en" ? "-mt-2 sm:-mt-5" : "-mt-6 sm:-mt-10"
          }`}
        >
          <div className="animate-rise" style={{ animationDelay: "160ms" }}>
            <HeroSearch
              districts={taxonomies.districts}
              landTypes={taxonomies.landTypes}
              locale={locale}
              statLine={interpolate(d.home.statBar, {
                listings: totalListings,
                districts: districts.length,
              })}
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
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center lg:gap-10">
        <div>
        <Reveal>
          <SectionHeading
            title={d.home.districtsTitle}
            subtitle={d.home.districtsSub}
          />
        </Reveal>
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {districts.map((district, i) => (
            <Reveal as="li" key={district._id} delay={Math.min(i * 55, 220)}>
              <Link
                href={href(`/districts/${district.slug}`)}
                className="group flex h-full items-center justify-between gap-4 rounded-[var(--radius-lg)]
                           border border-[var(--hairline)] bg-[var(--card)] p-5 lift glow-card"
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
        </div>
        <Image
          src="/district-map.webp"
          alt=""
          width={900}
          height={1080}
          sizes="480px"
          className="pointer-events-none -my-24 -ml-28 hidden h-auto w-[480px] max-w-none select-none lg:block"
        />
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      {/* Moved ahead of "Recently sold" — this answers the first-time
          visitor's question, and used to sit near the footer where it was
          rarely reached. */}
      <section id="how-it-works" className="container-kani relative scroll-mt-24 pt-16 md:pt-20">
        <Image
          src="/how-bg.webp"
          alt=""
          width={1400}
          height={468}
          sizes="(min-width: 1024px) 700px, 100vw"
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-8 hidden h-auto w-[62%] max-w-[760px] select-none opacity-80 md:block"
          style={{ maskImage: "linear-gradient(to right, transparent, #000 35%)" }}
        />
        <p
          aria-hidden="true"
          className="pointer-events-none absolute left-[46%] top-14 hidden max-w-[220px] -rotate-6 text-center
                     font-serif text-[24px] italic leading-tight text-[var(--kani-green)] lg:block"
        >
          {d.home.howNote}
        </p>
        <Reveal className="relative mb-6">
          <p className="mb-2 flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--palmyra-gold)]">
            {d.home.howEyebrow}
            <svg viewBox="0 0 40 8" className="h-2 w-10" fill="none" aria-hidden="true">
              <path d="M0 4h38M34 1l4 3-4 3" stroke="currentColor" strokeWidth="1.2"
                    strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </p>
          <h2 className="text-[27px] font-bold leading-tight text-[var(--heading)] md:text-[34px]">
            {d.home.howTitle}
          </h2>
          <p className="mt-1.5 max-w-2xl text-[15px] text-[var(--muted)] md:text-[16px]">
            {d.home.howSub}
          </p>
        </Reveal>
        <ol className="relative grid gap-4 md:mt-28 md:grid-cols-3">
          {[
            { n: "1", title: d.home.how1Title, body: d.home.how1Body, img: "/how-1.webp" },
            { n: "2", title: d.home.how2Title, body: d.home.how2Body, img: "/how-2.webp" },
            { n: "3", title: d.home.how3Title, body: d.home.how3Body, img: "/how-3.webp" },
          ].map((step, i) => (
            <Reveal as="li" key={step.n} delay={i * 70}>
              <div className="h-full rounded-[10px] border border-[var(--hairline)] bg-[var(--card)] p-6">
                <div className="mb-3 flex min-h-[100px] items-start justify-between">
                  <span
                    className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--kani-green)]
                               font-serif text-[19px] text-white"
                    aria-hidden="true"
                  >
                    {step.n}
                  </span>
                  <Image
                    src={step.img}
                    alt=""
                    width={560}
                    height={step.n === "3" ? 518 : 373}
                    sizes="210px"
                    aria-hidden="true"
                    className="pointer-events-none -mr-3 -mt-3 h-auto w-[170px] select-none"
                  />
                </div>
                <h3 className="mb-2 text-[21px] text-[var(--kani-green)]">{step.title}</h3>
                <p className="text-[15px] leading-relaxed text-[var(--muted)]">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
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

      {/* ── List-your-land CTA ───────────────────────────────────────── */}
      <Reveal as="div">
        <ListLandCta whatsappNumber={whatsapp || phone} locale={locale} />
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
