import { en, type Dictionary } from "./dictionaries/en";
import { ta } from "./dictionaries/ta";
import type { Locale } from "./config";

export type { Dictionary };
export * from "./config";

const DICTIONARIES: Record<Locale, Dictionary> = { en, ta };

/**
 * Both dictionaries are plain objects bundled with the app — there is no async
 * loading and no network hop, so a Server Component can call this directly and
 * a Client Component can hold the whole thing in context. Two small locales do
 * not justify the complexity of dynamic imports.
 */
export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale] ?? DICTIONARIES.ta;
}

/**
 * Fills `{name}` placeholders. Kept intentionally minimal — we have no plural
 * rules or gendered forms to handle, and the two we do need (`{count}`,
 * `{year}`) are simple substitutions.
 *
 *   interpolate("{count} listings", { count: 12 }) -> "12 listings"
 */
export function interpolate(
  template: string,
  values?: Record<string, string | number>
): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match
  );
}
