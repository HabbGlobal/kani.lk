/**
 * Locale primitives. This module is deliberately dependency-free and safe to
 * import from a client component, the edge proxy, or a Server Component — do
 * not add imports here (the same rule `image-url.ts` follows).
 */
export const LOCALES = ["ta", "en"] as const;

export type Locale = (typeof LOCALES)[number];

/** Tamil is the default: kani.lk serves Northern & Eastern Sri Lanka. */
export const DEFAULT_LOCALE: Locale = "ta";

/** Remembers the visitor's choice across sessions. Readable by JS by design. */
export const LOCALE_COOKIE = "kani_lang";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Narrows any input to a supported locale, falling back to Tamil. */
export function toLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** The `lang` attribute / `hreflang` value for a locale. */
export const HTML_LANG: Record<Locale, string> = { ta: "ta-LK", en: "en-LK" };

/** What the switch button offers next — there are only two locales. */
export function otherLocale(locale: Locale): Locale {
  return locale === "ta" ? "en" : "ta";
}

/**
 * Strips a leading /ta or /en from a pathname, returning the locale-free path.
 * `/ta/lands` -> `/lands`, `/en` -> `/`.
 */
export function stripLocale(pathname: string): string {
  for (const l of LOCALES) {
    if (pathname === `/${l}`) return "/";
    if (pathname.startsWith(`/${l}/`)) return pathname.slice(l.length + 1);
  }
  return pathname;
}

/** Builds a locale-prefixed href. `("/lands", "en")` -> `/en/lands`. */
export function localeHref(pathname: string, locale: Locale): string {
  const bare = stripLocale(pathname);
  return bare === "/" ? `/${locale}` : `/${locale}${bare}`;
}
