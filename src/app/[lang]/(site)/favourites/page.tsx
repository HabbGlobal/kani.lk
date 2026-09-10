import type { Metadata } from "next";
import { FavouritesList } from "@/components/land/FavouritesList";
import { getDictionary } from "@/lib/i18n";
import { toLocale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const d = getDictionary(toLocale((await params).lang));

  return {
    title: d.favourites.metaTitle,
    description: d.favourites.metaDescription,
    // Device-local content: nothing here is worth indexing.
    robots: { index: false, follow: true },
  };
}

export default async function FavouritesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const locale = toLocale((await params).lang);
  const d = getDictionary(locale);

  return (
    <div className="container-kani py-8 md:py-12">
      <header className="mb-8 max-w-2xl">
        <h1 className="text-[27px] text-[var(--kani-green)] md:text-[34px]">
          {d.favourites.pageTitle}
        </h1>
        <p className="mt-2 text-[16px] leading-relaxed text-[var(--muted)]">
          {d.favourites.pageIntro}
        </p>
      </header>

      <FavouritesList locale={locale} />
    </div>
  );
}
