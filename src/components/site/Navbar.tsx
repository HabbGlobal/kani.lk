"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { LanguageSwitch } from "./LanguageSwitch";
import { useFavourites } from "@/lib/favourites";
import { useI18n } from "@/lib/i18n/client";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { cn } from "@/lib/utils";

/** Paths are locale-free here; `href()` prefixes them at render time. */
const LINKS = [
  { href: "/lands", key: "browseLand" },
  { href: "/for-sale", key: "forSale" },
  { href: "/for-rent", key: "forRent" },
  { href: "/districts", key: "districts" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
] as const;

/**
 * Floating oval navbar. It sits over the hero as dark glass, and swaps to light
 * glass once the page scrolls past the hero — so the wordmark and links keep
 * their contrast against both a photograph and the bone background.
 */
export function Navbar({ overHero = false }: { overHero?: boolean }) {
  const pathname = usePathname();
  const { d, href } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const { ids, ready } = useFavourites();
  const lastY = useRef(0);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the mobile menu on navigation. Genuinely reacting to an external
  // event (the router changing pathname), not derivable state.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    // The hero is ~72vh; switch the treatment a little before its bottom edge.
    const threshold = overHero ? Math.round(window.innerHeight * 0.62) : 24;
    lastY.current = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > threshold);

      // Ignore the top of the page entirely, and small jitters — only a real
      // scroll of ~8px in one direction toggles the bar.
      const delta = y - lastY.current;
      if (y < 80) {
        setHidden(false);
      } else if (delta > 8) {
        setHidden(true);
      } else if (delta < -8) {
        setHidden(false);
      }
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overHero]);

  const closeMenu = () => setOpen(false);
  useFocusTrap(open, menuRef, closeMenu);

  // The bar is solid black in every state, so its text/icon colors are the
  // on-dark treatment throughout — only the glow/border variant still shifts
  // with scroll position. (There used to be a light-glass branch selected by
  // a `dark` flag; it was never reachable, since the flag was always true, so
  // it's been removed rather than kept as dead conditionals.)
  const overHeroGlow = overHero && !scrolled;

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]
                   focus:rounded-full focus:bg-[var(--kani-green)] focus:px-5 focus:py-3 focus:text-white"
      >
        {d.common.skipToContent}
      </a>

      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 on-dark md:px-6 md:pt-5">
        <nav
          aria-label={d.nav.mainNav}
          className={cn(
            "container-kani flex items-center gap-1.5 !px-2 sm:gap-3 md:!px-3",
            // The oval: a fully rounded pill, floating clear of the page edge.
            "h-[68px] rounded-[var(--radius-pill)] glass-nav md:h-[76px]",
            overHeroGlow && "glass-nav--over-hero",
            scrolled && "md:h-[70px]",
            // Never hide it behind the visitor's back while the mobile menu is open.
            hidden && !open && "glass-nav-hidden"
          )}
        >
          <Link
            href={href("/")}
            aria-label={d.nav.homeAria}
            className="nav-logo-capsule ml-1 shrink-0 rounded-full md:ml-3"
          >
            <Logo onDark className="[&>span:first-child]:max-[400px]:hidden" />
          </Link>

          {/* Keep the full navigation for widths that fit both locales. */}
          <ul
            className="ml-auto hidden items-center gap-0.5 rounded-[var(--radius-pill)]
                       border px-1 py-1 nav-group--dark xl:flex xl:px-1.5 xl:py-1.5"
          >
            {LINKS.map((link) => {
              const to = href(link.href);
              const active = pathname === to || pathname.startsWith(`${to}/`);
              return (
                <li key={link.href}>
                  <Link
                    href={to}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative whitespace-nowrap rounded-[var(--radius-pill)] px-2.5 py-1.5 text-sm font-medium",
                      "transition-[background-color,color,box-shadow] duration-200",
                      "xl:px-3.5 xl:py-2 xl:text-[15px]",
                      active
                        ? "bg-[var(--palmyra-gold)] text-[var(--kani-green-deep)] nav-pill-glow--dark"
                        : "font-semibold text-[#123F32] hover:bg-white/30 hover:text-[#123F32]"
                    )}
                  >
                    {d.nav[link.key]}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1 xl:ml-1">
            <LanguageSwitch onDark />

            <Link
              href={href("/favourites")}
              aria-label={`${d.nav.savedLands}${ready && ids.length ? ` (${ids.length})` : ""}`}
              className="relative grid size-9 place-items-center rounded-full bg-white/80 sm:size-11 text-[#123F32]
                         transition-colors duration-200 nav-fav-glow hover:bg-white/90"
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="none" strokeWidth="1.9"
                   stroke="currentColor" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 20.3 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 1 1 19.4 13Z" />
              </svg>
              {ready && ids.length > 0 && (
                <span
                  className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full
                             bg-[var(--laterite)] px-1 text-[11px] font-bold leading-5 text-white"
                >
                  {ids.length > 99 ? "99+" : ids.length}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? d.nav.closeMenu : d.nav.openMenu}
              className="nav-hamburger grid size-9 cursor-pointer place-items-center rounded-full sm:size-11 text-[#123F32]
                         transition-colors duration-200 xl:hidden"
            >
              <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor"
                   strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
                {open ? (
                  <path d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <>
                    <path d="M4 7h16" />
                    <path d="M4 12h16" />
                    <path d="M4 17h11" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      {open && (
        <div className="fixed inset-0 z-40 xl:hidden">
          <button
            type="button"
            aria-label={d.nav.closeMenu}
            onClick={() => setOpen(false)}
            className="absolute inset-0 w-full cursor-default bg-[var(--kani-green-deep)]/45 animate-fade backdrop-blur-[2px]"
          />
          <div
            id="mobile-menu"
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label={d.nav.mainNav}
            className="absolute inset-x-3 max-h-[calc(100dvh-var(--nav-h)-32px)] overflow-y-auto rounded-[var(--radius-xl)]
                       border border-[var(--hairline)] bg-[var(--bone)] p-2 shadow-[var(--shadow-lg)]
                       animate-rise"
            style={{ top: "calc(var(--nav-h) + 16px)" }}
          >
            <ul>
              {LINKS.map((link, i) => {
                const to = href(link.href);
                const active = pathname === to || pathname.startsWith(`${to}/`);
                return (
                  <li key={link.href}>
                    <Link
                      href={to}
                      aria-current={active ? "page" : undefined}
                      style={{ animationDelay: `${i * 28}ms` }}
                      className={cn(
                        "flex items-center justify-between rounded-[var(--radius-md)] px-4 py-3.5",
                        "text-[17px] font-medium animate-rise",
                        active
                          ? "bg-[var(--kani-green)]/8 text-[var(--kani-green)]"
                          : "text-[var(--ink)] hover:bg-black/[0.04]"
                      )}
                    >
                      {d.nav[link.key]}
                      <svg viewBox="0 0 16 16" className="size-4 text-[var(--muted)]" fill="none"
                           aria-hidden="true">
                        <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6"
                              strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
