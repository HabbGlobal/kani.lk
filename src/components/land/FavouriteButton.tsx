"use client";

import { useState } from "react";
import { useFavourites } from "@/lib/favourites";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

/**
 * The heart. Motion here confirms an action rather than decorating — the fill
 * pops once on save and does nothing on unsave.
 */
export function FavouriteButton({
  landId,
  title,
  className,
  tone = "glass",
}: {
  landId: string;
  title: string;
  className?: string;
  tone?: "glass" | "solid";
}) {
  const { has, toggle, ready } = useFavourites();
  const { d, t } = useI18n();
  const [justSaved, setJustSaved] = useState(false);
  const saved = ready && has(landId);

  return (
    <button
      type="button"
      // Sits above the card's full-area link.
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const nowSaved = toggle(landId);
        if (nowSaved) {
          setJustSaved(true);
          window.setTimeout(() => setJustSaved(false), 340);
        }
      }}
      aria-pressed={saved}
      aria-label={
        saved
          ? t(d.favourites.removeFromSaved, { title })
          : t(d.favourites.saveTitled, { title })
      }
      title={saved ? d.land.saved : d.land.saveAria}
      className={cn(
        "relative z-10 grid size-11 cursor-pointer place-items-center rounded-full",
        "transition-[background-color,transform] duration-200 [transition-timing-function:var(--ease-out)]",
        "active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2",
        tone === "glass"
          ? "bg-white/85 backdrop-blur-[3px] hover:bg-white shadow-[0_2px_8px_rgba(10,44,30,0.2)]"
          : "border border-[var(--hairline)] bg-white hover:bg-black/[0.03]",
        className
      )}
    >
      <svg
        viewBox="0 0 24 24"
        className={cn(
          "size-5 transition-colors duration-200",
          saved ? "fill-[var(--laterite)] stroke-[var(--laterite)]" : "fill-none stroke-[var(--kani-green)]",
          justSaved && "animate-pop"
        )}
        strokeWidth="1.9"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 20.3 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 1 1 19.4 13Z" />
      </svg>
    </button>
  );
}
