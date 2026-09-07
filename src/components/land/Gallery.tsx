"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { imageUrl } from "@/lib/image-url";
import { PurposeBadge, StatusRibbon } from "@/components/ui/Badge";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import type { LandStatus, Purpose } from "@/models/types";

type GalleryImage = { _id: string; alt: string; width: number; height: number };

/**
 * Listing gallery. Keyboard navigable (arrow keys, Escape out of the lightbox),
 * and the images themselves are just URLs into /api/images/[id] — the payload
 * never travels in the page.
 */
export function Gallery({
  images,
  title,
  purpose,
  status,
  blurThumb,
}: {
  images: GalleryImage[];
  title: string;
  purpose: Purpose;
  status: LandStatus;
  blurThumb?: string;
}) {
  const { d, locale } = useI18n();
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  const count = images.length;
  const go = useCallback(
    (delta: number) => setIndex((i) => (i + delta + count) % count),
    [count]
  );

  useEffect(() => {
    if (count <= 1 && !lightbox) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Escape" && lightbox) setLightbox(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [go, count, lightbox]);

  useEffect(() => {
    if (!lightbox) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [lightbox]);

  if (count === 0) {
    return (
      <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] bg-[var(--hairline)] sm:aspect-[16/10]">
        <Image
          src="/placeholder-land.svg"
          alt={d.favourites.noPhotosAlt}
          fill
          className="object-cover"
        />
      </div>
    );
  }

  const current = images[index];
  const isGone = status === "sold" || status === "rented";

  return (
    <>
      <div className="space-y-3">
        <div
          ref={mainRef}
          className="group relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)]
                     bg-[var(--hairline)] sm:aspect-[16/10]"
        >
          <Image
            key={current._id}
            src={imageUrl(current._id)}
            alt={current.alt || title}
            fill
            priority={index === 0}
            sizes="(min-width: 1024px) 780px, 100vw"
            placeholder={index === 0 && blurThumb ? "blur" : "empty"}
            blurDataURL={index === 0 ? blurThumb || undefined : undefined}
            className={cn("animate-fade object-cover", isGone && "img-sold")}
          />

          <StatusRibbon status={status} locale={locale} />
          <div className="absolute left-4 top-4 z-10">
            <PurposeBadge purpose={purpose} locale={locale} />
          </div>

          {count > 1 && (
            <>
              <GalleryArrow side="left" onClick={() => go(-1)} prevLabel={d.favourites.previousPhoto} nextLabel={d.favourites.nextPhoto} />
              <GalleryArrow side="right" onClick={() => go(1)} prevLabel={d.favourites.previousPhoto} nextLabel={d.favourites.nextPhoto} />
              <span className="tabular absolute bottom-4 left-4 rounded-[var(--radius-pill)]
                               bg-[var(--kani-green-deep)]/72 px-3 py-1.5 text-[13px] text-white
                               backdrop-blur-[2px]">
                {index + 1} / {count}
              </span>
            </>
          )}

          <button
            type="button"
            onClick={() => setLightbox(true)}
            className="absolute bottom-4 right-4 z-10 inline-flex h-11 cursor-pointer items-center gap-2
                       rounded-[var(--radius-pill)] bg-white/90 px-4 text-[14px] font-medium
                       text-[var(--kani-green)] backdrop-blur-sm transition-colors hover:bg-white"
          >
            <svg viewBox="0 0 16 16" className="size-4" fill="none" aria-hidden="true">
              <path d="M6 2H2v4M10 2h4v4M6 14H2v-4M10 14h4v-4" stroke="currentColor"
                    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            View full size
          </button>
        </div>

        {count > 1 && (
          <ul className="rail flex gap-2.5 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <li key={img._id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show photo ${i + 1} of ${count}`}
                  aria-current={i === index}
                  className={cn(
                    "relative block size-20 cursor-pointer overflow-hidden rounded-[var(--radius-md)]",
                    "transition-[opacity,box-shadow] duration-200 sm:size-24",
                    i === index
                      ? "opacity-100 ring-2 ring-[var(--kani-green)] ring-offset-2 ring-offset-[var(--bone)]"
                      : "opacity-65 hover:opacity-100"
                  )}
                >
                  <Image
                    src={imageUrl(img._id)}
                    alt=""
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} — photo ${index + 1} of ${count}`}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[var(--kani-green-deep)]/95 animate-fade"
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            aria-label={d.common.close}
            autoFocus
            className="absolute right-4 top-4 z-10 grid size-12 cursor-pointer place-items-center
                       rounded-full bg-white/12 text-white transition-colors hover:bg-white/22"
          >
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor"
                 strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          <div className="relative h-full max-h-[86vh] w-full max-w-6xl px-4">
            <Image
              src={imageUrl(current._id)}
              alt={current.alt || title}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {count > 1 && (
            <>
              <GalleryArrow side="left" onClick={() => go(-1)} onDark prevLabel={d.favourites.previousPhoto} nextLabel={d.favourites.nextPhoto} />
              <GalleryArrow side="right" onClick={() => go(1)} onDark prevLabel={d.favourites.previousPhoto} nextLabel={d.favourites.nextPhoto} />
              <p className="tabular absolute bottom-6 left-1/2 -translate-x-1/2 text-[15px] text-white/80">
                {index + 1} / {count}
              </p>
            </>
          )}
        </div>
      )}
    </>
  );
}

function GalleryArrow({
  side,
  onClick,
  onDark = false,
  prevLabel,
  nextLabel,
}: {
  side: "left" | "right";
  onClick: () => void;
  onDark?: boolean;
  prevLabel: string;
  nextLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? prevLabel : nextLabel}
      className={cn(
        "absolute top-1/2 z-10 grid size-12 -translate-y-1/2 cursor-pointer place-items-center rounded-full",
        "transition-[background-color,opacity] duration-200",
        side === "left" ? "left-3" : "right-3",
        onDark
          ? "bg-white/12 text-white hover:bg-white/25"
          : "bg-white/85 text-[var(--kani-green)] backdrop-blur-sm hover:bg-white " +
            // Hidden until hover on pointer devices; always visible on touch.
            "opacity-0 group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
      )}
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor"
           strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {side === "left" ? <path d="M15 5l-7 7 7 7" /> : <path d="M9 5l7 7-7 7" />}
      </svg>
    </button>
  );
}
