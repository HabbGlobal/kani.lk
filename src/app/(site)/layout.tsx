import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

/**
 * Public shell. The navbar floats over the content, so only the homepage —
 * which owns a full-bleed hero — opts into the transparent-over-photo state.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main id="main" className="flex-1 pt-24 md:pt-28">
        {children}
      </main>
      <Footer />
    </>
  );
}
