import Image from "next/image";
import Link from "next/link";
import { PurposeBadge, StatusRibbon } from "@/components/ui/Badge";
import { FavouriteButton } from "./FavouriteButton";
import { formatLKR, formatSize } from "@/lib/units";
import { imageUrl } from "@/lib/image-url";
import { DEED_TYPE_LABELS } from "@/models/types";
import { cn } from "@/lib/utils";
import type { LandCard as LandCardType } from "@/lib/queries";

/**
 * Land cards lead with size and price per perch, because that is the comparison
 * buyers here actually make. House-portal cards lead with the photo and the
 * bedroom count; that would make this site a generic clone.
 */
export function LandCard({
  land,
  priority = false,
  className,
  sizes = "(min-width: 1024px) 380px, (min-width: 640px) 45vw, 92vw",
  href,
  newTab = false,
  showFavourite = true,
}: {
  land: LandCardType;
  /** Set on the first couple of above-the-fold cards only. */
  priority?: boolean;
  className?: string;
  sizes?: string;
  /** Overrides the default `/lands/[slug]` target — used by the admin preview. */
  href?: string;
  newTab?: boolean;
  /** Off for the admin editor's live preview — favouriting isn't an admin action. */
  showFavourite?: boolean;
}) {
  const isGone = land.status === "sold" || land.status === "rented";
  const place = [land.area, land.city?.name].filter(Boolean).join(" · ");

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)]",
        "border border-[var(--hairline)] bg-[var(--card)] lift",
        className
      )}
    >
      {/* ── cover ─────────────────────────────────────────────────────── */}
      <div className="zoom-frame relative aspect-[4/3] bg-[var(--hairline)]">
        <Image
          src={imageUrl(land.coverImageId)}
          alt={land.title}
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          placeholder={land.coverThumb ? "blur" : "empty"}
          blurDataURL={land.coverThumb || undefined}
          className={cn("object-cover", isGone && "img-sold")}
        />

        <StatusRibbon status={land.status} />

        {/* Purpose must be readable from the image alone, before any text. */}
        <div className="absolute left-3 top-3 z-10">
          <PurposeBadge purpose={land.purpose} size="sm" />
        </div>

        {showFavourite && (
          <div className="absolute right-3 top-3 z-10">
            <FavouriteButton landId={land._id} title={land.title} />
          </div>
        )}

        {land.imageCount > 1 && (
          <span
            className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5
                       rounded-[var(--radius-pill)] bg-[var(--kani-green-deep)]/72 px-2.5 py-1
                       text-[12px] font-medium text-white backdrop-blur-[2px]"
          >
            <svg viewBox="0 0 16 16" className="size-3.5" fill="none" aria-hidden="true">
              <rect x="2" y="3.5" width="12" height="9" rx="1.6"
                    stroke="currentColor" strokeWidth="1.4" />
              <path d="M2 10.5l3-2.6 2.4 2 2.6-2.4 4 3.4"
                    stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
            {land.imageCount}
            <span className="sr-only">photos</span>
          </span>
        )}
      </div>

      {/* ── body ──────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        {/* Size first, then place. */}
        <div>
          <h3 className="text-[19px] leading-snug text-[var(--kani-green)]">
            <Link
              href={href ?? `/lands/${land.slug}`}
              target={newTab ? "_blank" : undefined}
              rel={newTab ? "noopener noreferrer" : undefined}
              className="after:absolute after:inset-0 after:content-['']"
            >
              {formatSize(land.sizeValue, land.sizeUnit)}
              {place && <span className="text-[var(--ink)]"> · {place}</span>}
            </Link>
          </h3>
          <p className="text-[14px] text-[var(--muted)]">{land.district?.name}</p>
        </div>

        <PriceBlock land={land} />

        {/* The two facts that decide interest. */}
        <ul className="mt-auto space-y-1 pt-1 text-[14px] text-[var(--muted)]">
          {land.distanceFromTownKm != null && land.nearestTown && (
            <li className="flex items-center gap-1.5">
              <svg viewBox="0 0 16 16" className="size-3.5 shrink-0" fill="none" aria-hidden="true">
                <path d="M1 11h14M1 11l2.5-3M15 11l-2.5-3" stroke="currentColor"
                      strokeWidth="1.3" strokeLinecap="round" />
                <circle cx="8" cy="5" r="2.2" stroke="currentColor" strokeWidth="1.3" />
              </svg>
              {land.distanceFromTownKm} km from {land.nearestTown} town
            </li>
          )}
          {(land.deedType || land.accessRoadWidthFt) && (
            <li className="truncate">
              {[
                land.deedType && DEED_TYPE_LABELS[land.deedType],
                land.accessRoadWidthFt && `${land.accessRoadWidthFt}ft road`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </li>
          )}
        </ul>

        <p className="tabular pt-1 text-right text-[12px] tracking-wide text-[var(--muted)]/80">
          {land.refCode}
        </p>
      </div>
    </article>
  );
}

/**
 * A "both" listing shows the sale price and the rent + deposit stacked — never
 * one price standing in for the other.
 */
function PriceBlock({ land }: { land: LandCardType }) {
  const struck = land.status === "sold" || land.status === "rented";

  if (land.priceOnRequest) {
    return (
      <p className="font-serif text-[21px] text-[var(--kani-green)]">Price on request</p>
    );
  }

  const showSale = land.purpose !== "rent" && land.salePrice;
  const showRent = land.purpose !== "sale" && land.rentAmount;

  return (
    <div className={cn(struck && "opacity-70")}>
      {showSale && (
        <p
          className={cn(
            "tabular font-serif text-[24px] leading-tight text-[var(--kani-green)]",
            struck && "line-through decoration-[var(--laterite)] decoration-2"
          )}
        >
          {formatLKR(land.salePrice!)}
          {land.priceNegotiable && (
            <span className="ml-1.5 font-sans text-[13px] font-medium text-[var(--muted)]">
              negotiable
            </span>
          )}
        </p>
      )}

      {/* The comparison number. */}
      {showSale && land.pricePerPerch && (
        <p className="tabular text-[14px] text-[var(--muted)]">
          {formatLKR(land.pricePerPerch)} per perch
        </p>
      )}

      {showRent && (
        <p
          className={cn(
            "tabular",
            showSale
              ? "mt-1 text-[15px] text-[var(--ink)]"
              : "font-serif text-[24px] leading-tight text-[var(--kani-green)]",
            struck && "line-through decoration-[var(--laterite)] decoration-2"
          )}
        >
          {formatLKR(land.rentAmount!)}
          <span className="font-sans text-[14px] text-[var(--muted)]">
            /{land.rentPeriod === "year" ? "year" : "month"}
          </span>
          {land.depositAmount ? (
            <span className="font-sans text-[14px] text-[var(--muted)]">
              {" "}· deposit {formatLKR(land.depositAmount)}
            </span>
          ) : null}
        </p>
      )}
    </div>
  );
}

/** Skeleton matching the card's exact geometry, so nothing shifts on load. */
export function LandCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--hairline)] bg-[var(--card)]">
      <div className="skeleton aspect-[4/3]" />
      <div className="space-y-2.5 p-4">
        <div className="skeleton h-5 w-3/4 rounded" />
        <div className="skeleton h-4 w-1/3 rounded" />
        <div className="skeleton h-7 w-1/2 rounded" />
        <div className="skeleton h-4 w-2/3 rounded" />
      </div>
    </div>
  );
}
