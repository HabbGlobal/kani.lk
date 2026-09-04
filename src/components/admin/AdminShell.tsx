"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/site/Logo";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/lib/auth";

const THEME_KEY = "kani.admin-theme";
const COLLAPSE_KEY = "kani.admin-sidebar-collapsed";

const NAV: { href: string; label: string; icon: React.ReactNode; superadminOnly?: boolean }[] = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: <path d="M3 10l7-6 7 6M5 9v8h10V9" />,
  },
  {
    href: "/admin/lands",
    label: "Listings",
    icon: <><rect x="3" y="4" width="14" height="12" rx="1.5" /><path d="M3 8h14" /></>,
  },
  {
    href: "/admin/popular",
    label: "Popular row",
    icon: <path d="M10 2.5l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7Z" />,
  },
  {
    href: "/admin/inquiries",
    label: "Enquiries",
    icon: <><rect x="3" y="4.5" width="14" height="11" rx="1.5" /><path d="M3 6l7 5 7-5" /></>,
  },
  {
    href: "/admin/districts",
    label: "Districts",
    icon: <><circle cx="10" cy="8" r="5.5" /><path d="M10 13.5V17M7 17h6" /></>,
  },
  {
    href: "/admin/cities",
    label: "Cities & towns",
    icon: <><rect x="4" y="9" width="4" height="8" /><rect x="12" y="5" width="4" height="12" /></>,
  },
  {
    href: "/admin/land-types",
    label: "Land types",
    icon: <path d="M3 10l7-7 7 7-7 7-7-7Z" />,
  },
  {
    href: "/admin/pages",
    label: "Pages",
    icon: <><rect x="4" y="3" width="12" height="14" rx="1.2" /><path d="M7 7h6M7 10h6M7 13h4" /></>,
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: <><circle cx="10" cy="10" r="2.6" /><path d="M10 2.5v2M10 15.5v2M17.5 10h-2M4.5 10h-2M15.1 4.9l-1.4 1.4M6.3 13.7l-1.4 1.4M15.1 15.1l-1.4-1.4M6.3 6.3 4.9 4.9" /></>,
  },
  {
    href: "/admin/users",
    label: "Admin users",
    icon: <><circle cx="10" cy="7" r="3" /><path d="M4 17c0-3 2.7-5 6-5s6 2 6 5" /></>,
    superadminOnly: true,
  },
];

export function AdminShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Read saved preferences after mount — avoids a hydration mismatch, since
  // the server has no access to localStorage.
  useEffect(() => {
    if (window.localStorage.getItem(THEME_KEY) === "dark") {
      setDark(true);
      document.documentElement.classList.add("admin-dark");
    }
    if (window.localStorage.getItem(COLLAPSE_KEY) === "1") setCollapsed(true);
  }, []);

  function toggleDark() {
    setDark((cur) => {
      const next = !cur;
      document.documentElement.classList.toggle("admin-dark", next);
      window.localStorage.setItem(THEME_KEY, next ? "dark" : "light");
      return next;
    });
  }

  function toggleCollapsed() {
    setCollapsed((cur) => {
      const next = !cur;
      window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });
  }

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const items = NAV.filter((n) => !n.superadminOnly || user.role === "superadmin");

  function buildNav(rail: boolean) {
    return (
      <nav className="no-scrollbar flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              title={rail ? item.label : undefined}
              aria-label={rail ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-[var(--radius-md)] px-3.5 py-2.5 text-[15px] font-medium",
                "transition-colors duration-150",
                rail && "justify-center px-0",
                active
                  ? "bg-white/12 text-white"
                  : "text-white/65 hover:bg-white/8 hover:text-white"
              )}
            >
              <svg viewBox="0 0 20 20" className="size-[18px] shrink-0" fill="none"
                   stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                   strokeLinejoin="round" aria-hidden="true">
                {item.icon}
              </svg>
              {!rail && item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  const nav = buildNav(false);
  const navRail = buildNav(true);

  return (
    <div className="flex h-svh bg-[var(--bone)]">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden h-svh shrink-0 flex-col bg-[var(--kani-green-deep)] transition-[width] duration-200 lg:flex",
          collapsed ? "w-[76px]" : "w-64"
        )}
      >
        <div
          className={cn(
            "flex items-center py-6",
            collapsed ? "flex-col gap-3 px-2" : "justify-between gap-2 px-5"
          )}
        >
          <Logo onDark />
          <ThemeToggle dark={dark} onToggle={toggleDark} circle />
        </div>
        {collapsed ? navRail : nav}
        <div className={cn("flex items-center pt-2", collapsed ? "justify-center px-2" : "justify-end px-4")}>
          <IconOnlyButton
            label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={toggleCollapsed}
          >
            <path d={collapsed ? "M7 4l6 6-6 6" : "M13 4L7 10l6 6"} />
          </IconOnlyButton>
        </div>
        <UserFooter user={user} onSignOut={signOut} collapsed={collapsed} />
      </aside>

      {/* Mobile top bar + drawer */}
      <div className="flex flex-1 flex-col overflow-hidden lg:hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--hairline)]
                           bg-[var(--card)] px-4">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="grid size-11 cursor-pointer place-items-center rounded-full hover:bg-[var(--hover-tint)]"
          >
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor"
                 strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <Logo />
          <div className="size-11" aria-hidden="true" />
        </header>

        {mobileOpen && (
          <div className="fixed inset-0 z-50">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 w-full cursor-default bg-black/40 animate-fade"
            />
            <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-[var(--kani-green-deep)] animate-rise"
                 style={{ animationDuration: "220ms" }}>
              <div className="flex items-center justify-between px-5 py-6">
                <Logo onDark />
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close"
                  className="grid size-10 cursor-pointer place-items-center rounded-full text-white hover:bg-white/10"
                >
                  <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor"
                       strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                    <path d="M5 5l10 10M15 5L5 15" />
                  </svg>
                </button>
              </div>
              {nav}
              <div className="px-4 pt-2">
                <ThemeToggle dark={dark} onToggle={toggleDark} />
              </div>
              <UserFooter user={user} onSignOut={signOut} />
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>

      {/* Desktop content */}
      <main className="hidden flex-1 overflow-y-auto p-8 lg:block">{children}</main>
    </div>
  );
}

function ThemeToggle({
  dark,
  onToggle,
  compact,
  circle,
}: {
  dark: boolean;
  onToggle: () => void;
  compact?: boolean;
  circle?: boolean;
}) {
  const icon = (
    <svg viewBox="0 0 20 20" className="size-[17px] shrink-0" fill="none"
         stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
         strokeLinejoin="round" aria-hidden="true">
      {dark ? (
        <>
          <path d="M10 4.5v1.5M10 14v1.5M15.5 10H14M6 10H4.5M13.5 6.5l-1 1M7.5 12.5l-1 1M13.5 13.5l-1-1M7.5 7.5l-1-1" />
          <circle cx="10" cy="10" r="3" />
        </>
      ) : (
        <path d="M17 11.3A6.7 6.7 0 0 1 8.7 3 6.8 6.8 0 1 0 17 11.3Z" />
      )}
    </svg>
  );

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={dark}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "grid shrink-0 cursor-pointer place-items-center text-white/70",
        "transition-colors hover:bg-white/8 hover:text-white",
        circle
          ? "size-9 rounded-full border border-white/15"
          : cn("rounded-[var(--radius-md)]", compact ? "size-9" : "h-9 flex-1")
      )}
    >
      {icon}
    </button>
  );
}

function IconOnlyButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-[var(--radius-md)]
                 text-white/70 transition-colors hover:bg-white/8 hover:text-white"
    >
      <svg viewBox="0 0 20 20" className="size-[17px]" fill="none" stroke="currentColor"
           strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {children}
      </svg>
    </button>
  );
}

function UserFooter({
  user,
  onSignOut,
  collapsed,
}: {
  user: SessionUser;
  onSignOut: () => void;
  collapsed?: boolean;
}) {
  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-2 border-t border-white/10 p-3">
        <span
          title={`${user.name} · ${user.role}`}
          className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--palmyra-gold)]
                     text-[14px] font-semibold text-[var(--kani-green-deep)]"
        >
          {user.name.slice(0, 1).toUpperCase()}
        </span>
        <button
          type="button"
          onClick={onSignOut}
          aria-label="Sign out"
          title="Sign out"
          className="grid size-9 cursor-pointer place-items-center rounded-[var(--radius-md)]
                     text-red-400 transition-colors hover:bg-red-500/12 hover:text-red-300"
        >
          <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor"
               strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M7.5 17H4.5A1.5 1.5 0 0 1 3 15.5v-11A1.5 1.5 0 0 1 4.5 3h3M13 14l4-4-4-4M17 10H7.5" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-white/10 p-4">
      <div className="mb-2 flex items-center gap-3 px-1">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--palmyra-gold)]
                         text-[14px] font-semibold text-[var(--kani-green-deep)]">
          {user.name.slice(0, 1).toUpperCase()}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[14px] font-medium text-white">{user.name}</span>
          <span className="block truncate text-[12px] capitalize text-white/50">{user.role}</span>
        </span>
      </div>
      <button
        type="button"
        onClick={onSignOut}
        className="flex w-full cursor-pointer items-center gap-2 rounded-[var(--radius-md)]
                   px-3 py-2 text-[14px] font-medium text-red-400 transition-colors
                   hover:bg-red-500/12 hover:text-red-300"
      >
        <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor"
             strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M7.5 17H4.5A1.5 1.5 0 0 1 3 15.5v-11A1.5 1.5 0 0 1 4.5 3h3M13 14l4-4-4-4M17 10H7.5" />
        </svg>
        Sign out
      </button>
    </div>
  );
}
