"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Saved listings live in the visitor's own browser. No login, no modal, no nag,
 * and nothing is ever sent to the server — which is also what the privacy page
 * promises.
 */
const KEY = "kani.favourites.v1";
const EVENT = "kani:favourites";

const EMPTY: string[] = [];
// useSyncExternalStore needs a stable reference for an unchanged store, so the
// parsed array is cached against the raw string it came from.
let cachedRaw: string | null = null;
let cachedIds: string[] = EMPTY;

function read(): string[] {
  if (typeof window === "undefined") return EMPTY;
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    // Private mode or blocked storage — favourites are a convenience, so
    // degrade silently rather than breaking the page.
    return EMPTY;
  }
  if (raw === cachedRaw) return cachedIds;
  cachedRaw = raw;
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    cachedIds = Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : EMPTY;
  } catch {
    cachedIds = EMPTY;
  }
  return cachedIds;
}

function write(ids: string[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    /* storage unavailable — nothing to do */
  }
  // Notify every mounted hook in this tab; `storage` only fires cross-tab.
  window.dispatchEvent(new CustomEvent(EVENT));
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener(EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export function useFavourites() {
  const ids = useSyncExternalStore(subscribe, read, () => EMPTY);
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  const toggle = useCallback((id: string) => {
    const current = read();
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [id, ...current];
    write(next);
    return next.includes(id);
  }, []);

  const clear = useCallback(() => write([]), []);

  return { ids, ready, toggle, clear, has: (id: string) => ids.includes(id) };
}
