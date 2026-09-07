"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useFavourites } from "@/lib/favourites";
import { LandCard, LandCardSkeleton } from "./LandCard";
import { EmptyState } from "@/components/ui/Card";
import { ButtonLink, Button } from "@/components/ui/Button";
import type { LandCard as LandCardType } from "@/lib/queries";
import { useI18n } from "@/lib/i18n/client";
import { type Locale } from "@/lib/i18n/config";

export function FavouritesList({ locale }: { locale: Locale }) {
  const { ids, ready, clear } = useFavourites();
  const { d, t, href } = useI18n();
  const [items, setItems] = useState<LandCardType[] | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (ids.length === 0) {
      setItems([]);
      return;
    }

    let cancelled = false;
    fetch("/api/lands/by-ids", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setItems(data.items ?? []);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });

    return () => {
      cancelled = true;
    };
  }, [ids, ready]);

  if (!ready || items === null) {
    return (
      <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <li key={i}>
            <LandCardSkeleton />
          </li>
        ))}
      </ul>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title={d.favourites.emptyTitleLong}
        action={
          <ButtonLink href={href("/lands")}>{d.favourites.browseCta}</ButtonLink>
        }
      >
        <p>{d.favourites.emptyBodyLong}</p>
      </EmptyState>
    );
  }

  // Ids that no longer resolve: unpublished or deleted since being saved.
  const missing = ids.length - items.length;

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="text-[15px] text-[var(--muted)]">
          {items.length === 1
            ? d.favourites.savedCountOne
            : t(d.favourites.savedCount, { count: items.length })}
          {missing > 0 && (
            <span className="ml-1.5 text-[var(--muted)]/80">
              {t(d.favourites.noLongerAvailable, { count: missing })}
            </span>
          )}
        </p>
        <Button variant="ghost" size="sm" onClick={clear}>
          {d.common.clearAll}
        </Button>
      </div>

      <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((land, i) => (
          <li key={land._id}>
            <LandCard land={land} locale={locale} priority={i < 2} />
          </li>
        ))}
      </ul>

      <p className="mt-8 text-[15px] text-[var(--muted)]">
        {d.favourites.readyToEnquire}{" "}
        <Link
          href={href("/contact")}
          className="font-medium text-[var(--kani-green)] underline-offset-4 hover:underline"
        >
          {d.favourites.sendShortlist}
        </Link>{" "}
        {d.favourites.andWeWillHelp}
      </p>
    </>
  );
}
