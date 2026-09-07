import type { Metadata } from "next";
import { PurposeLanding } from "@/components/site/PurposeLanding";
import type { RawParams } from "@/lib/search-params";
import { getDictionary } from "@/lib/i18n";
import { toLocale } from "@/lib/i18n/config";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  const d = getDictionary(locale);

  return {
    title: d.forRent.metaTitle,
    description: d.forRent.metaDescription,
    alternates: {
      canonical: `/${locale}/for-rent`,
      languages: { "ta-LK": "/ta/for-rent", "en-LK": "/en/for-rent" },
    },
  };
}

export default async function ForRentPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<RawParams>;
}) {
  const locale = toLocale((await params).lang);
  const d = getDictionary(locale);

  return (
    <PurposeLanding
      purpose="rent"
      locale={locale}
      searchParams={await searchParams}
      title={d.forRent.title}
      intro={d.forRent.intro}
    />
  );
}
