/**
 * Builds a keyless Google Maps embed URL — no API key required, since it
 * rides the same `output=embed` parameter the "Embed a map" share dialog
 * itself uses. Google only accepts that param on a plain `/maps?q=...`
 * search URL; a `/maps/place/...` share link with an opaque `data=!4m2!...`
 * payload gets rejected with X-Frame-Options even though it opens fine in a
 * new tab, so those are never embedded as-is — only their coordinates or
 * place name are pulled out and re-built into a `?q=` search.
 */
export function buildMapEmbedUrl(googleMapsUrl: string | undefined, fallbackQuery: string): string | null {
  const url = googleMapsUrl?.trim();

  if (url) {
    try {
      const parsed = new URL(url);
      if (/(^|\.)google\.[a-z.]+$/.test(parsed.hostname) && parsed.pathname.startsWith("/maps")) {
        const q = parsed.searchParams.get("q");
        if (q) return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;

        // "/maps/place/<name>/@lat,lng,zoom" — pull whichever is present.
        const atMatch = parsed.pathname.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (atMatch) {
          return `https://maps.google.com/maps?q=${atMatch[1]},${atMatch[2]}&output=embed`;
        }
        const placeMatch = parsed.pathname.match(/\/maps\/place\/([^/@]+)/);
        if (placeMatch) {
          return `https://maps.google.com/maps?q=${encodeURIComponent(decodeURIComponent(placeMatch[1]).replace(/\+/g, " "))}&output=embed`;
        }
      }
    } catch {
      // Not a valid URL — fall through to the query-based embed below.
    }
  }

  const q = fallbackQuery.trim();
  if (!q) return null;
  return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
}
