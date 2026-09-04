"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { useFavourites } from "@/lib/favourites";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/lands", label: "Browse land" },
  { href: "/for-sale", label: "For sale" },
  { href: "/for-rent", label: "For rent" },
  { href: "/districts", label: "Districts" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/**
 * Floating oval navbar. It sits over the hero as dark glass, and swaps to light
 * glass once the page scrolls past the hero — so the wordmark and links keep
 * their contrast against both a photograph and the bone background.
 */
export function Navbar({ overHero = false }: { overHero?: boolean }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const { ids, ready } = useFavourites();
  const lastY = useRef(0);

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

  useEffect(() => setOpen(false), [pathname]);

  // Never hide it behind the visitor's back while the mobile menu is open.
  useEffect(() => {
    if (open) setHidden(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const dark = overHero && !scrolled;

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]
                   focus:rounded-full focus:bg-[var(--kani-green)] focus:px-5 focus:py-3 focus:text-white"
      >
        Skip to content
      </a>

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6 md:pt-5",
          dark && "on-dark"
        )}
      >
        <nav
          aria-label="Main"
          className={cn(
            "container-kani flex items-center gap-3 !px-2 md:!px-3",
            // The oval: a fully rounded pill, floating clear of the page edge.
            "h-16 rounded-[var(--radius-pill)] glass-nav md:h-[68px]",
            dark && "glass-nav--over-hero",
            scrolled && "md:h-[62px]",
            hidden && "glass-nav-hidden"
          )}
        >
          <Link
            href="/"
            aria-label="kani.lk home"
            className="ml-2 shrink-0 rounded-full md:ml-3"
          >
            <Logo onDark={dark} />
          </Link>

          {/* Desktop links — one glowing oval group, not a separate pill per
              link, echoing a single capsule holding every nav item. */}
          <ul
            className={cn(
              "ml-auto hidden items-center gap-0.5 rounded-[var(--radius-pill)] border px-1.5 py-1.5 lg:flex",
              dark ? "nav-group--dark" : "nav-group"
            )}
          >
            {LINKS.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative rounded-[var(--radius-pill)] px-3.5 py-2 text-[15px] font-medium",
                      "transition-[background-color,color,box-shadow] duration-200",
                      active
                        ? dark
                          ? "bg-[var(--palmyra-gold)] text-[var(--kani-green-deep)] nav-pill-glow--dark"
                          : "bg-[var(--kani-green)] text-white nav-pill-glow"
                        : dark
                          ? "text-white/85 hover:bg-white/12 hover:text-white"
                          : "text-[var(--ink)] hover:bg-[var(--kani-green)]/8 hover:text-[var(--kani-green)]"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="ml-auto flex items-center gap-1 lg:ml-1">
            <Link
              href="/favourites"
              aria-label={`Saved lands${ready && ids.length ? ` (${ids.length})` : ""}`}
              className={cn(
                "relative grid size-11 place-items-center rounded-full transition-colors duration-200",
                dark ? "text-white hover:bg-white/12" : "text-[var(--kani-green)] hover:bg-black/[0.05]"
              )}
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
              aria-label={open ? "Close menu" : "Open menu"}
              className={cn(
                "grid size-11 cursor-pointer place-items-center rounded-full transition-colors duration-200 lg:hidden",
                dark ? "text-white hover:bg-white/12" : "text-[var(--kani-green)] hover:bg-black/[0.05]"
              )}
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
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 w-full cursor-default bg-[var(--kani-green-deep)]/45 animate-fade backdrop-blur-[2px]"
          />
          <div
            id="mobile-menu"
            className="absolute inset-x-3 top-[84px] overflow-hidden rounded-[var(--radius-xl)]
                       border border-[var(--hairline)] bg-[var(--bone)] p-2 shadow-[var(--shadow-lg)]
                       animate-rise"
          >
            <ul>
              {LINKS.map((link, i) => {
                const active =
                  pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
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
                      {link.label}
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
