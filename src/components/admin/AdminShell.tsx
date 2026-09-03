"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/site/Logo";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/lib/auth";

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

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const items = NAV.filter((n) => !n.superadminOnly || user.role === "superadmin");

  const nav = (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
      {items.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-[var(--radius-md)] px-3.5 py-2.5 text-[15px] font-medium",
              "transition-colors duration-150",
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
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-svh bg-[var(--bone)]">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-[var(--kani-green-deep)] lg:flex">
        <div className="px-5 py-6">
          <Logo onDark />
        </div>
        {nav}
        <UserFooter user={user} onSignOut={signOut} />
      </aside>

      {/* Mobile top bar + drawer */}
      <div className="flex flex-1 flex-col lg:hidden">
        <header className="flex h-16 items-center justify-between border-b border-[var(--hairline)]
                           bg-[var(--card)] px-4">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="grid size-11 cursor-pointer place-items-center rounded-full hover:bg-black/5"
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
              <UserFooter user={user} onSignOut={signOut} />
            </div>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>

      {/* Desktop content */}
      <main className="hidden flex-1 overflow-y-auto p-8 lg:block">{children}</main>
    </div>
  );
}

function UserFooter({ user, onSignOut }: { user: SessionUser; onSignOut: () => void }) {
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
                   px-3 py-2 text-[14px] text-white/65 transition-colors hover:bg-white/8 hover:text-white"
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
