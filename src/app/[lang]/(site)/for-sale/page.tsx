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
    title: d.forSale.metaTitle,
    description: d.forSale.metaDescription,
    alternates: {
      canonical: `/${locale}/for-sale`,
      languages: { "ta-LK": "/ta/for-sale", "en-LK": "/en/for-sale" },
    },
  };
}

export default async function ForSalePage({
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
      purpose="sale"
      locale={locale}
      searchParams={await searchParams}
      title={d.forSale.title}
      intro={d.forSale.intro}
    />
  );
}
