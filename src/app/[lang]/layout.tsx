import { notFound } from "next/navigation";
import { I18nProvider } from "@/lib/i18n/client";
import { LOCALES, isLocale } from "@/lib/i18n/config";

/**
 * Every public route sits under this segment, so the locale is a first-class
 * part of the URL rather than a cookie the CDN cannot see. Both locales are
 * pre-rendered — there are only two, and they cover the whole public site.
 */
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  // A URL like /fr/lands is a genuine 404, not a silent fallback to Tamil.
  if (!isLocale(lang)) notFound();

  return <I18nProvider locale={lang}>{children}</I18nProvider>;
}
