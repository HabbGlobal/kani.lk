import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

/**
 * The homepage owns a full-bleed hero photograph, so the navbar starts as dark
 * glass sitting over it and there is no top padding on main.
 */
export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar overHero />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
