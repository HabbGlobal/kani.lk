import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageBody } from "@/components/site/PageBody";
import { getPage } from "@/lib/queries";
import { getDictionary } from "@/lib/i18n";
import { toLocale } from "@/lib/i18n/config";
import { localizedPage } from "@/lib/i18n/localized";

export const revalidate = 600;

const SLUG = "terms";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  const page = await getPage(SLUG);
  if (!page) return {};

  const { title } = localizedPage(page, locale);

  return {
    // seoTitle is authored in English only; the localized title is the better
    // fallback for a Tamil reader than an English SEO override.
    title: locale === "ta" ? title : page.seoTitle || title,
    description: page.seoDescription,
    alternates: {
      canonical: `/${locale}/${SLUG}`,
      languages: { "ta-LK": `/ta/${SLUG}`, "en-LK": `/en/${SLUG}` },
    },
  };
}

export default async function ContentPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const locale = toLocale((await params).lang);
  const d = getDictionary(locale);
  const page = await getPage(SLUG);
  if (!page) notFound();

  const { title, body, bodyIsFallback } = localizedPage(page, locale);

  return (
    <div className="container-kani py-8 md:py-12">
      <article className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-[27px] text-[var(--kani-green)] md:text-[34px]">
          {title}
        </h1>
        {bodyIsFallback && (
          <p className="mb-4 text-[14px] text-[var(--muted)]">
            {d.land.englishDescriptionNote}
          </p>
        )}
        <div lang={bodyIsFallback ? "en" : undefined}>
          <PageBody body={body} />
        </div>
      </article>
    </div>
  );
}
