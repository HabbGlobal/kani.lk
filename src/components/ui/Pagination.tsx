import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/**
 * Server-rendered pagination — real links, so they work without JS, can be
 * opened in a new tab, and are crawlable.
 */
export function Pagination({
  page,
  pages,
  buildHref,
  locale = DEFAULT_LOCALE,
}: {
  page: number;
  pages: number;
  buildHref: (page: number) => string;
  locale?: Locale;
}) {
  const d = getDictionary(locale);

  if (pages <= 1) return null;

  // Window of pages around the current one, with first/last always reachable.
  const window: (number | "gap")[] = [];
  const push = (n: number) => !window.includes(n) && window.push(n);

  push(1);
  if (page > 3) window.push("gap");
  for (let n = Math.max(2, page - 1); n <= Math.min(pages - 1, page + 1); n++) {
    push(n);
  }
  if (page < pages - 2) window.push("gap");
  if (pages > 1) push(pages);

  return (
    <nav
      aria-label={d.admin.pagination}
      className="mt-10 flex items-center justify-center gap-1.5"
    >
      <PageLink
        href={buildHref(page - 1)}
        disabled={page <= 1}
        aria-label={d.home.previousPage}
      >
        <svg viewBox="0 0 16 16" className="size-4" fill="none" aria-hidden="true">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.7"
                strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </PageLink>

      {window.map((entry, i) =>
        entry === "gap" ? (
          <span key={`gap-${i}`} className="px-1 text-[var(--muted)]" aria-hidden="true">
            …
          </span>
        ) : (
          <PageLink
            key={entry}
            href={buildHref(entry)}
            active={entry === page}
            aria-label={`Page ${entry}`}
            aria-current={entry === page ? "page" : undefined}
          >
            {entry}
          </PageLink>
        )
      )}

      <PageLink
        href={buildHref(page + 1)}
        disabled={page >= pages}
        aria-label={d.home.nextPage}
      >
        <svg viewBox="0 0 16 16" className="size-4" fill="none" aria-hidden="true">
          <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.7"
                strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  active,
  disabled,
  children,
  ...props
}: {
  href: string;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  const className = cn(
    "grid h-11 min-w-11 place-items-center rounded-[var(--radius-pill)] px-3",
    "text-[15px] font-medium transition-colors duration-200",
    active
      ? "bg-[var(--kani-green)] text-white"
      : "text-[var(--ink)] hover:bg-[var(--hover-tint)]"
  );

  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className={cn(className, "pointer-events-none text-[var(--muted)]/45")}
        {...props}
      >
        {children}
      </span>
    );
  }

  return (
    <Link href={href} className={className} {...props}>
      {children}
    </Link>
  );
}
