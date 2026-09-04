"use client";

import { useEffect } from "react";

/**
 * Fires once per mount via sendBeacon (falls back to fetch/keepalive), so it
 * survives the user navigating away immediately and never blocks rendering.
 * Deliberately outside the ISR-cached page render — see the route handler.
 */
export function ViewTracker({ landId }: { landId: string }) {
  useEffect(() => {
    const url = `/api/lands/${landId}/view`;
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob());
    } else {
      fetch(url, { method: "POST", keepalive: true }).catch(() => {});
    }
  }, [landId]);

  return null;
}
