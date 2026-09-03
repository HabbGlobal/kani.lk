"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useFavourites } from "@/lib/favourites";
import { LandCard, LandCardSkeleton } from "./LandCard";
import { EmptyState } from "@/components/ui/Card";
import { ButtonLink, Button } from "@/components/ui/Button";
import type { LandCard as LandCardType } from "@/lib/queries";

export function FavouritesList() {
  const { ids, ready, clear } = useFavourites();
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
        title="You have not saved anything yet"
        action={<ButtonLink href="/lands">Browse land</ButtonLink>}
      >
        <p>
          Tap the heart on any listing to keep it here. No account needed — the
          list lives on this device.
        </p>
      </EmptyState>
    );
  }

  // Ids that no longer resolve: unpublished or deleted since being saved.
  const missing = ids.length - items.length;

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="text-[15px] text-[var(--muted)]">
          {items.length} saved {items.length === 1 ? "listing" : "listings"}
          {missing > 0 && (
            <span className="ml-1.5 text-[var(--muted)]/80">
              ({missing} no longer available)
            </span>
          )}
        </p>
        <Button variant="ghost" size="sm" onClick={clear}>
          Clear all
        </Button>
      </div>

      <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((land, i) => (
          <li key={land._id}>
            <LandCard land={land} priority={i < 2} />
          </li>
        ))}
      </ul>

      <p className="mt-8 text-[15px] text-[var(--muted)]">
        Ready to enquire?{" "}
        <Link href="/contact" className="font-medium text-[var(--kani-green)] underline-offset-4 hover:underline">
          Send us your shortlist
        </Link>{" "}
        and we will help you arrange visits.
      </p>
    </>
  );
}
