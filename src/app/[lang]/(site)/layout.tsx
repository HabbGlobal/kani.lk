import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { toLocale } from "@/lib/i18n/config";

/**
 * Public shell. The navbar floats over the content, so only the homepage —
 * which owns a full-bleed hero — opts into the transparent-over-photo state.
 */
export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const locale = toLocale((await params).lang);

  return (
    <>
      <Navbar />
      {/* Top padding derives from --nav-h (the floating navbar's own height)
          plus a fixed clearance, so it can never drift out of sync with the
          bar the way separate `pt-24 md:pt-28` guesses could. */}
      <main id="main" className="flex-1 [padding-top:calc(var(--nav-h)+28px)]">
        {children}
      </main>
      <Footer locale={locale} />
    </>
  );
}
