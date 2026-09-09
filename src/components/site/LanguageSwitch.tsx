"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { useI18n } from "@/lib/i18n/client";
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  localeHref,
  otherLocale,
} from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/**
 * The Tamil/English switch. A two-state toggle rather than a dropdown — there
 * are exactly two locales, and a switch reads faster than a menu on a phone.
 *
 * It writes the cookie before navigating so the choice survives a later visit
 * to a bare URL (the proxy reads that cookie to pick the locale), then pushes
 * the same page under the other locale. Query string and hash are preserved so
 * a filtered /lands view does not reset when the language changes.
 */
export function LanguageSwitch({ onDark = false }: { onDark?: boolean }) {
  const { locale, d } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const next = otherLocale(locale);

  function switchTo() {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;

    const qs = searchParams.toString();
    const target = localeHref(pathname, next) + (qs ? `?${qs}` : "");

    startTransition(() => {
      router.push(target);
      // The <html lang> attribute lives in the root layout, which reads the
      // cookie on the server — refresh so it re-renders with the new value.
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={switchTo}
      disabled={pending}
      aria-label={d.language.ariaLabel}
      title={d.language.ariaLabel}
      className={cn(
        "relative flex h-11 shrink-0 items-center rounded-[var(--radius-pill)] border p-0.5",
        "text-[13px] font-semibold transition-colors duration-200",
        pending && "opacity-60",
        onDark
          ? "border-white/20 bg-white/10 text-white hover:border-white/35"
          : "border-[var(--hairline)] bg-black/[0.04] text-[var(--ink)] hover:border-[var(--kani-green)]/40"
      )}
    >
      {/* Both labels are always rendered: the active one is highlighted, so the
          control shows what you are on AND what you would get. */}
      <Segment active={locale === "ta"} onDark={onDark}>
        {d.language.tamil}
      </Segment>
      <Segment active={locale === "en"} onDark={onDark}>
        {d.language.english}
      </Segment>
    </button>
  );
}

function Segment({
  active,
  onDark,
  children,
}: {
  active: boolean;
  onDark: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "grid h-10 place-items-center rounded-[var(--radius-pill)] px-2.5 leading-none transition-colors duration-200",
        active
          ? onDark
            ? "bg-[var(--palmyra-gold)] text-[var(--kani-green-deep)]"
            : "bg-[var(--kani-green)] text-white"
          : onDark
            ? "text-white/70"
            : "text-[var(--muted)]"
      )}
    >
      {children}
    </span>
  );
}
