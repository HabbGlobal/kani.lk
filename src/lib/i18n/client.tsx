"use client";

import { createContext, useContext, useMemo } from "react";
import { getDictionary, interpolate, type Dictionary } from "./index";
import { localeHref, type Locale } from "./config";

type I18nValue = {
  locale: Locale;
  d: Dictionary;
  /** Interpolates a string pulled off `d`: `t(d.districts.countListings, { count })`. */
  t: (template: string, values?: Record<string, string | number>) => string;
  /** Prefixes an app path with the active locale: `href("/lands")` -> `/ta/lands`. */
  href: (path: string) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

/**
 * Mounted once in the `[lang]` layout. The dictionary is a bundled object, so
 * passing it through context costs nothing at runtime and saves every client
 * component from taking a `locale` prop.
 */
export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const value = useMemo<I18nValue>(
    () => ({
      locale,
      d: getDictionary(locale),
      t: interpolate,
      href: (path: string) => localeHref(path, locale),
    }),
    [locale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** Client-side access to the active locale and its dictionary. */
export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used inside <I18nProvider>");
  }
  return ctx;
}
