"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useI18n } from "@/lib/i18n/client";
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  otherLocale,
} from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/**
 * The dashboard's Tamil/English switch. Admin routes carry no locale segment,
 * so unlike the public switch this only writes the cookie and refreshes — the
 * layout re-reads it on the server and the whole dashboard comes back in the
 * other language. The cookie is shared with the public site, so a choice made
 * in either place holds in both.
 */
export function AdminLanguageSwitch({ collapsed = false }: { collapsed?: boolean }) {
  const { locale, d } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const next = otherLocale(locale);

  function switchTo() {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
    startTransition(() => router.refresh());
  }

  return (
    <button
      type="button"
      onClick={switchTo}
      disabled={pending}
      aria-label={d.language.ariaLabel}
      title={d.language.ariaLabel}
      className={cn(
        // Lives in the dark green sidebar, so it follows the nav's on-dark
        // treatment rather than the admin surface tokens.
        "flex h-9 w-full cursor-pointer items-center gap-2 rounded-[var(--radius-md)]",
        "px-2.5 text-[13px] font-medium transition-colors duration-150",
        "text-white/65 hover:bg-white/8 hover:text-white",
        pending && "opacity-60",
        collapsed && "justify-center px-0"
      )}
    >
      <svg viewBox="0 0 20 20" className="size-4 shrink-0" fill="none" stroke="currentColor"
           strokeWidth="1.6" aria-hidden="true">
        <circle cx="10" cy="10" r="7.5" />
        <path d="M2.5 10h15M10 2.5c2 2.4 3 4.9 3 7.5s-1 5.1-3 7.5c-2-2.4-3-4.9-3-7.5s1-5.1 3-7.5Z" />
      </svg>
      {!collapsed && (
        // Shows the language you would switch TO, which is what a one-tap
        // toggle needs to say.
        <span>{next === "ta" ? d.language.tamil : d.language.english}</span>
      )}
    </button>
  );
}
