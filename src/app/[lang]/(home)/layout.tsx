import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { toLocale } from "@/lib/i18n/config";

/**
 * The homepage owns a full-bleed hero photograph, so the navbar starts as dark
 * glass sitting over it and there is no top padding on main.
 */
export default async function HomeLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const locale = toLocale((await params).lang);

  return (
    <>
      <Navbar overHero />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer locale={locale} />
    </>
  );
}
