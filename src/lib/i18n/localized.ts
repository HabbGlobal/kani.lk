import type { Locale } from "./config";

/**
 * Admin-entered content is bilingual by column, not by document: District,
 * City and LandType each carry `nameTa`, and Land carries `descriptionTa`.
 * These fields have existed in the schema from the start but were never read
 * by the site — these helpers are the single place that resolves them.
 *
 * Fallback is always to English, never to an empty string: a listing whose
 * Tamil description the admin has not written yet must still render something.
 */

type Named = { name: string; nameTa?: string | null };

/** Resolves the display name of a district / city / land type. */
export function localizedName(entity: Named | null | undefined, locale: Locale): string {
  if (!entity) return "";
  if (locale === "ta") {
    const ta = entity.nameTa?.trim();
    if (ta) return ta;
  }
  return entity.name;
}

type Described = { description?: string | null; descriptionTa?: string | null };

/** Resolves a listing's description body. */
export function localizedDescription(
  land: Described | null | undefined,
  locale: Locale
): string {
  if (!land) return "";
  if (locale === "ta") {
    const ta = land.descriptionTa?.trim();
    if (ta) return ta;
  }
  return land.description ?? "";
}

/**
 * True when the visitor is reading Tamil but this listing has no Tamil
 * description, so the UI is showing the English one. Lets a caller mark the
 * block `lang="en"` for screen readers instead of lying about the language.
 */
export function isDescriptionFallback(
  land: Described | null | undefined,
  locale: Locale
): boolean {
  return locale === "ta" && !land?.descriptionTa?.trim() && Boolean(land?.description);
}
