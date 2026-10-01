import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PageBody } from "@/components/site/PageBody";
import { getPage } from "@/lib/queries";
import { getDictionary } from "@/lib/i18n";
import { toLocale } from "@/lib/i18n/config";
import { localizedPage } from "@/lib/i18n/localized";

export const revalidate = 600;

const SLUG = "about";

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
      {/* Watermark mark, large and blurred behind the copy — decorative only,
          so it's aria-hidden. `fixed` (not `absolute`) pins it to the
          viewport rather than the article, so it stays in place, centered,
          as the page scrolls instead of travelling with the text. */}
      <Image
        src="/navbar-logo.png"
        alt=""
        aria-hidden="true"
        width={1170}
        height={811}
        className="pointer-events-none fixed left-1/2 top-1/2 -z-10 w-[380px] max-w-none
                   -translate-x-1/2 -translate-y-1/2 select-none opacity-[0.11] blur-[1px]
                   sm:w-[480px] md:w-[640px]"
      />

      <article className="mx-auto max-w-3xl">
        <div className="mb-8 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--hairline)]">
          <Image
            src="/kani about.png"
            alt={d.about.heroAlt}
            width={1915}
            height={821}
            priority
            className="h-auto w-full object-cover"
            sizes="(min-width: 768px) 768px, 100vw"
          />
        </div>

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
