import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/land/Gallery";
import { ViewTracker } from "@/components/land/ViewTracker";
import { ContactPanel } from "@/components/land/ContactPanel";
import { LandGrid } from "@/components/site/LandRail";
import { StatusPill, Chip } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/Card";
import {
  getLandBySlug,
  getLandImages,
  getSimilarLands,
  type LandCard,
} from "@/lib/queries";
import { formatLKR, formatSize } from "@/lib/units";
import { imageUrl } from "@/lib/image-url";
import { type DeedType, type WaterSource } from "@/models/types";
import { truncate } from "@/lib/utils";
import { buildMapEmbedUrl } from "@/lib/maps";
import { getDictionary, interpolate, type Dictionary } from "@/lib/i18n";
import { localeHref, toLocale, type Locale } from "@/lib/i18n/config";
import {
  localizedName,
  localizedDescription,
  isDescriptionFallback,
} from "@/lib/i18n/localized";
import * as EnumLabel from "@/lib/i18n/enums";

export const revalidate = 300;

type Params = {
  params: Promise<{ slug: string; lang: string }>;
  searchParams: Promise<{ preview?: string }>;
};

/** The full listing document, beyond the card projection. */
type LandDetail = LandCard & {
  description: string;
  descriptionTa?: string;
  ownerName: string;
  contactNumbers: string[];
  whatsappNumber?: string;
  addressLine?: string;
  googleMapsUrl?: string;
  frontageFt?: number;
  buildingSizeSqft?: number;
  bedrooms?: number;
  bathrooms?: number;
  waterSource?: WaterSource;
  utilities?: {
    electricity: boolean;
    waterLine: boolean;
    well: boolean;
    telecom: boolean;
  };
  features?: string[];
  publishedAt?: string;
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug, lang } = await params;
  const locale = toLocale(lang);
  const d = getDictionary(locale);
  const land = (await getLandBySlug(slug)) as LandDetail | null;
  if (!land) return { title: d.land.notFound };

  const purposeWord =
    land.purpose === "rent" ? d.land.metaForRent : d.land.metaForSale;
  const place = [
    land.area,
    localizedName(land.city, locale),
    localizedName(land.district, locale),
  ]
    .filter(Boolean)
    .join(", ");
  const title = interpolate(d.land.metaTitle, {
    size: formatSize(land.sizeValue, land.sizeUnit, locale),
    type: localizedName(land.landType, locale),
    purpose: purposeWord,
    place,
  });

  // Describe the listing in the language being read, falling back to English.
  const body = truncate(
    localizedDescription(land, locale).replace(/\s+/g, " "),
    155
  );

  return {
    title,
    description: body,
    alternates: {
      canonical: `/${locale}/lands/${land.slug}`,
      languages: {
        "ta-LK": `/ta/lands/${land.slug}`,
        "en-LK": `/en/lands/${land.slug}`,
      },
    },
    openGraph: {
      title,
      description: body,
      type: "article",
      images: land.coverImageId
        ? [{ url: imageUrl(land.coverImageId), width: 1200, height: 900, alt: land.title }]
        : undefined,
    },
  };
}

export default async function LandDetailPage({ params, searchParams }: Params) {
  const { slug, lang } = await params;
  const locale = toLocale(lang);
  const d = getDictionary(locale);
  const { preview } = await searchParams;
  const land = (await getLandBySlug(slug)) as LandDetail | null;
  if (!land) notFound();

  const [images, similar] = await Promise.all([
    getLandImages(land._id),
    land.status === "sold" || land.status === "rented"
      ? getSimilarLands(land, 4)
      : Promise.resolve([]),
  ]);

  const isGone = land.status === "sold" || land.status === "rented";
  const description = localizedDescription(land, locale);
  const descriptionIsEnglish = isDescriptionFallback(land, locale);
  const place = [land.area, localizedName(land.city, locale)]
    .filter(Boolean)
    .join(", ");
  // The map query stays in English: Google Maps resolves the romanized
  // place names far more reliably than the Tamil ones.
  const mapQuery = [
    land.addressLine,
    land.area,
    land.city?.name,
    land.district?.name,
    "Sri Lanka",
  ]
    .filter(Boolean)
    .join(", ");
  const mapEmbedUrl = buildMapEmbedUrl(land.googleMapsUrl, mapQuery);
  const mapLink =
    land.googleMapsUrl?.trim() ||
    (mapQuery ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}` : null);

  return (
    <article className="container-kani py-6 md:py-10">
      {preview === "1" && <PreviewBar landId={land._id} d={d} />}

      <Breadcrumbs land={land} locale={locale} d={d} />

      <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_400px] lg:gap-10">
        <div className="min-w-0">
          <Gallery
            images={images}
            title={land.title}
            purpose={land.purpose}
            status={land.status}
            blurThumb={land.coverThumb}
          />

          {/* Title + price, repeated under the gallery for mobile scanning. */}
          <header className="mt-6">
            <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <StatusPill status={land.status} locale={locale} />
              <span className="tabular text-[13px] text-[var(--muted)]">
                {land.refCode}
              </span>
            </div>

            <h1 className="text-[27px] leading-tight text-[var(--kani-green)] md:text-[34px]">
              {formatSize(land.sizeValue, land.sizeUnit, locale)}
              {place && <span className="text-[var(--ink)]"> · {place}</span>}
            </h1>
            <p className="mt-1 text-[16px] text-[var(--muted)]">
              {interpolate(d.land.typeInDistrict, {
                type: localizedName(land.landType, locale),
                district: localizedName(land.district, locale),
              })}
            </p>

            <PriceHeadline land={land} struck={isGone} locale={locale} d={d} />
          </header>

          {/* ── Specification ─────────────────────────────────────────── */}
          <section className="mt-8">
            <h2 className="mb-4 text-[21px] text-[var(--kani-green)]">
              {d.land.specification}
            </h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-[var(--radius-lg)]
                           border border-[var(--hairline)] bg-[var(--card)] p-5 sm:grid-cols-3">
              <Spec
                label={d.land.landSize}
                value={formatSize(land.sizeValue, land.sizeUnit, locale)}
              />
              {land.sizeUnit !== "perch" && (
                <Spec
                  label={d.land.inPerches}
                  value={interpolate(d.land.perchesValue, {
                    n: Math.round(land.sizeInPerches * 100) / 100,
                  })}
                />
              )}
              {land.pricePerPerch && !land.priceOnRequest && (
                <Spec
                  label={d.land.pricePerPerchLabel}
                  value={formatLKR(land.pricePerPerch)}
                />
              )}
              {land.deedType && (
                <Spec
                  label={d.lands.deedType}
                  value={EnumLabel.DEED_TYPE[locale][land.deedType as DeedType]}
                />
              )}
              {land.accessRoadWidthFt != null && (
                <Spec
                  label={d.land.accessRoad}
                  value={interpolate(d.land.feet, { n: land.accessRoadWidthFt })}
                />
              )}
              {land.frontageFt != null && (
                <Spec
                  label={d.land.frontage}
                  value={interpolate(d.land.feet, { n: land.frontageFt })}
                />
              )}
              {land.distanceFromTownKm != null && land.nearestTown && (
                <Spec
                  label={d.land.distanceFromTown}
                  value={interpolate(d.land.distanceValue, {
                    km: land.distanceFromTownKm,
                    town: land.nearestTown,
                  })}
                />
              )}
              {land.waterSource && land.waterSource !== "none" && (
                <Spec
                  label={d.land.waterSource}
                  value={EnumLabel.WATER_SOURCE[locale][land.waterSource as WaterSource]}
                />
              )}
              {land.buildingSizeSqft != null && (
                <Spec
                  label={d.land.buildingSize}
                  value={interpolate(d.land.sqftValue, {
                    n: land.buildingSizeSqft.toLocaleString("en-LK"),
                  })}
                />
              )}
              {land.bedrooms != null && (
                <Spec label={d.land.bedrooms} value={String(land.bedrooms)} />
              )}
              {land.bathrooms != null && (
                <Spec label={d.land.bathrooms} value={String(land.bathrooms)} />
              )}
              {land.depositAmount != null && (
                <Spec label={d.land.deposit} value={formatLKR(land.depositAmount)} />
              )}
            </dl>

            {land.utilities && (
              <div className="mt-4">
                <h3 className="mb-2 text-[15px] font-semibold text-[var(--ink)]">
                  {d.land.utilitiesHeading}
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {[
                    [d.land.electricity, land.utilities.electricity],
                    [d.land.waterLine, land.utilities.waterLine],
                    [d.land.well, land.utilities.well],
                    [d.land.telecomLong, land.utilities.telecom],
                  ].map(([label, on]) => (
                    <li key={String(label)}>
                      <Chip tone={on ? "green" : "neutral"}>
                        <svg viewBox="0 0 16 16" className="size-3.5" fill="none" aria-hidden="true">
                          {on ? (
                            <path d="M3.5 8.5l3 3 6-6.5" stroke="currentColor" strokeWidth="1.8"
                                  strokeLinecap="round" strokeLinejoin="round" />
                          ) : (
                            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6"
                                  strokeLinecap="round" />
                          )}
                        </svg>
                        {String(label)}
                      </Chip>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {land.features && land.features.length > 0 && (
              <div className="mt-4">
                <h3 className="mb-2 text-[15px] font-semibold text-[var(--ink)]">
                  {d.land.featuresHeading}
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {land.features.map((f) => (
                    <li key={f}>
                      <Chip tone="gold">{f}</Chip>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* ── Description ───────────────────────────────────────────── */}
          <section className="mt-8">
            <h2 className="mb-3 text-[21px] text-[var(--kani-green)]">
              {land.landType
                ? interpolate(d.land.aboutThis, {
                    type: localizedName(land.landType, locale).toLowerCase(),
                  })
                : d.land.aboutThisFallback}
            </h2>
            {/* One description, in the language being read. When a Tamil
                reader hits a listing with no Tamil copy we show the English
                and mark it lang="en" rather than mislabel it. */}
            <div
              className="prose-kani text-[17px] leading-relaxed text-[var(--ink)]"
              lang={descriptionIsEnglish ? "en" : undefined}
            >
              {description.split(/\n\s*\n/).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
            {descriptionIsEnglish && (
              <p className="mt-2 text-[14px] text-[var(--muted)]">
                {d.land.englishDescriptionNote}
              </p>
            )}
          </section>

          {/* ── Location ──────────────────────────────────────────────── */}
          <section className="mt-8">
            <h2 className="mb-3 text-[21px] text-[var(--kani-green)]">
              {d.land.location}
            </h2>
            <div className="rounded-[var(--radius-lg)] border border-[var(--hairline)] bg-[var(--card)] p-5
                             sm:grid sm:grid-cols-[1fr_auto] sm:gap-5">
              <div className="min-w-0">
                <address className="not-italic text-[16px] leading-relaxed text-[var(--ink)]">
                  {[
                    land.addressLine,
                    land.area,
                    localizedName(land.city, locale),
                    interpolate(d.land.districtSuffix, {
                      district: localizedName(land.district, locale),
                    }),
                  ]
                    .filter(Boolean)
                    .map((line, i) => (
                      <span key={i} className="block">{line}</span>
                    ))}
                </address>
                {land.distanceFromTownKm != null && land.nearestTown && (
                  <p className="mt-2 text-[15px] text-[var(--muted)]">
                    {interpolate(d.land.aboutDistanceLine, {
                      km: land.distanceFromTownKm,
                      town: land.nearestTown,
                    })}
                  </p>
                )}
                {mapLink && (
                  <a
                    href={mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex h-11 items-center gap-2 rounded-[var(--radius-pill)]
                               border border-[var(--kani-green)]/35 px-5 text-[15px] font-medium
                               text-[var(--kani-green)] transition-colors hover:bg-[var(--kani-green)]/6"
                  >
                    {d.land.openInMaps}
                    <svg viewBox="0 0 16 16" className="size-3.5" fill="none" aria-hidden="true">
                      <path d="M6 3h7v7M13 3L4 12" stroke="currentColor" strokeWidth="1.6"
                            strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                )}
              </div>

              {mapEmbedUrl && (
                <div
                  className="mt-4 h-[220px] w-full overflow-hidden rounded-[var(--radius-md)]
                             border border-[var(--hairline)] sm:mt-0 sm:h-full sm:w-[320px]"
                >
                  <iframe
                    src={mapEmbedUrl}
                    title={interpolate(d.land.mapTitle, {
                      place: place || land.title,
                    })}
                    className="size-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ── Contact ─────────────────────────────────────────────────── */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <ContactPanel
            landId={land._id}
            landTitle={land.title}
            refCode={land.refCode}
            ownerName={land.ownerName}
            contactNumbers={land.contactNumbers}
            whatsappNumber={land.whatsappNumber}
            status={land.status}
            locale={locale}
          />
        </aside>
      </div>

      {/* Turns a sold listing from a dead end into a lead. */}
      {isGone && similar.length > 0 && (
        <section className="mt-16">
          <SectionHeading
            title={interpolate(d.land.availableIn, {
              district: localizedName(land.district, locale),
            })}
            subtitle={d.land.goneSubtitle}
          />
          <LandGrid lands={similar} locale={locale} priorityCount={0} />
        </section>
      )}

      <JsonLd land={land} images={images} locale={locale} d={d} />
      <ViewTracker landId={land._id} />
    </article>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[13px] uppercase tracking-wide text-[var(--muted)]">{label}</dt>
      <dd className="mt-0.5 text-[16px] font-medium text-[var(--ink)]">{value}</dd>
    </div>
  );
}

function PriceHeadline({
  land,
  struck,
  locale,
  d,
}: {
  land: LandDetail;
  struck: boolean;
  locale: Locale;
  d: Dictionary;
}) {
  if (land.priceOnRequest) {
    return (
      <p className="mt-4 font-serif text-[27px] text-[var(--kani-green)]">
        {d.land.priceOnRequest}
      </p>
    );
  }

  const showSale = land.purpose !== "rent" && land.salePrice;
  const showRent = land.purpose !== "sale" && land.rentAmount;

  return (
    <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
      {showSale && (
        <p
          className={`tabular font-serif text-[34px] leading-none text-[var(--kani-green)] ${
            struck ? "line-through decoration-[var(--laterite)] decoration-2" : ""
          }`}
        >
          {formatLKR(land.salePrice!)}
        </p>
      )}
      {showRent && (
        <p
          className={`tabular font-serif leading-none text-[var(--kani-green)] ${
            showSale ? "text-[21px]" : "text-[34px]"
          } ${struck ? "line-through decoration-[var(--laterite)] decoration-2" : ""}`}
        >
          {formatLKR(land.rentAmount!)}
          <span className="font-sans text-[16px] text-[var(--muted)]">
            /{EnumLabel.RENT_PERIOD[locale][land.rentPeriod === "year" ? "year" : "month"]}
          </span>
        </p>
      )}
      {land.priceNegotiable && (
        <span className="text-[15px] font-medium text-[var(--muted)]">
          {d.land.negotiable}
        </span>
      )}
      {showSale && land.pricePerPerch && (
        <span className="tabular w-full text-[16px] text-[var(--muted)]">
          {formatLKR(land.pricePerPerch)} {d.land.perPerch}
        </span>
      )}
    </div>
  );
}

function Breadcrumbs({
  land,
  locale,
  d,
}: {
  land: LandDetail;
  locale: Locale;
  d: Dictionary;
}) {
  const crumbs = [
    { name: d.land.breadcrumbHome, href: localeHref("/", locale) },
    { name: d.land.breadcrumbLand, href: localeHref("/lands", locale) },
    {
      name: localizedName(land.district, locale),
      href: localeHref(`/districts/${land.district?.slug}`, locale),
    },
  ];

  return (
    <nav aria-label={d.land.breadcrumb}>
      <ol className="flex flex-wrap items-center gap-1.5 text-[14px] text-[var(--muted)]">
        {crumbs.map((c) => (
          <li key={c.href} className="flex items-center gap-1.5">
            <Link href={c.href} className="transition-colors hover:text-[var(--kani-green)]">
              {c.name}
            </Link>
            <span aria-hidden="true">/</span>
          </li>
        ))}
        <li className="truncate text-[var(--ink)]" aria-current="page">
          {land.refCode}
        </li>
      </ol>
    </nav>
  );
}

/** Shown only when this page is opened from the admin editor's live preview. */
function PreviewBar({ landId, d }: { landId: string; d: Dictionary }) {
  return (
    <div
      className="sticky top-3 z-30 mb-5 flex items-center justify-between gap-3 rounded-[var(--radius-md)]
                 border border-[var(--palmyra-gold)]/40 bg-[var(--palmyra-gold)]/12 px-4 py-3
                 backdrop-blur-sm"
    >
      <p className="text-[14px] font-medium text-[var(--kani-green-deep)]">
        {d.land.previewNote}
      </p>
      <Link
        href={`/admin/lands/${landId}/edit`}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--kani-green)]
                   px-4 py-2 text-[14px] font-medium text-white transition-colors hover:bg-[var(--kani-green-deep)]"
      >
        <svg viewBox="0 0 16 16" className="size-3.5" fill="none" aria-hidden="true">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.7"
                strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {d.land.returnToDashboard}
      </Link>
    </div>
  );
}

/** RealEstateListing + BreadcrumbList, so the listing can win a rich result. */
function JsonLd({
  land,
  images,
  locale,
  d,
}: {
  land: LandDetail;
  images: { _id: string }[];
  locale: Locale;
  d: Dictionary;
}) {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kani.lk";
  // Structured data has to point at the localized URL actually being served,
  // or Google sees a canonical/@id mismatch on every listing.
  const url = `${site}/${locale}/lands/${land.slug}`;

  const graph: Record<string, unknown>[] = [
    {
      "@type": "RealEstateListing",
      "@id": url,
      url,
      name: land.title,
      inLanguage: locale,
      description: truncate(
        localizedDescription(land, locale).replace(/\s+/g, " "),
        300
      ),
      datePosted: land.publishedAt ?? land.createdAt,
      image: images.slice(0, 6).map((i) => `${site}${imageUrl(i._id)}`),
      address: {
        "@type": "PostalAddress",
        addressLocality: localizedName(land.city, locale),
        addressRegion: localizedName(land.district, locale),
        addressCountry: "LK",
      },
      ...(land.salePrice && !land.priceOnRequest
        ? {
            offers: {
              "@type": "Offer",
              price: land.salePrice,
              priceCurrency: "LKR",
              availability:
                land.status === "available"
                  ? "https://schema.org/InStock"
                  : "https://schema.org/SoldOut",
            },
          }
        : {}),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: d.land.breadcrumbHome,
          item: `${site}/${locale}`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: d.land.breadcrumbLand,
          item: `${site}/${locale}/lands`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: localizedName(land.district, locale),
          item: `${site}/${locale}/districts/${land.district?.slug}`,
        },
        { "@type": "ListItem", position: 4, name: land.title, item: url },
      ],
    },
  ];

  return (
    <script
      type="application/ld+json"
      // Content is our own data, serialized by JSON.stringify.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }),
      }}
    />
  );
}
