"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Saved listings live in the visitor's own browser. No login, no modal, no nag,
 * and nothing is ever sent to the server — which is also what the privacy page
 * promises.
 */
const KEY = "kani.favourites.v1";
const EVENT = "kani:favourites";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    // Private mode, blocked storage, corrupt value — favourites are a
    // convenience, so degrade silently rather than breaking the page.
    return [];
  }
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

export function useFavourites() {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIds(read());
    setReady(true);

    const sync = () => setIds(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    const current = read();
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [id, ...current];
    write(next);
    setIds(next);
    return next.includes(id);
  }, []);

  const clear = useCallback(() => {
    write([]);
    setIds([]);
  }, []);

  return { ids, ready, toggle, clear, has: (id: string) => ids.includes(id) };
}
