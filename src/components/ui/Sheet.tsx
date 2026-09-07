"use client";

import { useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

/**
 * Mobile bottom sheet. Used for the filter panel. Traps focus, closes on Escape
 * and on backdrop click, and locks background scroll while open.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const { d } = useI18n();
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    // Move focus into the sheet so keyboard and screen-reader users land there.
    panelRef.current
      ?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      ?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;

      const focusables = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute("disabled"));
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      previouslyFocused.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] lg:hidden" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        aria-label={d.home.closeFilters}
        onClick={onClose}
        className="absolute inset-0 w-full cursor-default bg-[var(--kani-green-deep)]/45 animate-fade backdrop-blur-[2px]"
      />
      <div
        ref={panelRef}
        className={cn(
          "absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col",
          "rounded-t-[var(--radius-xl)] bg-[var(--bone)] shadow-[0_-8px_40px_rgba(10,44,30,0.3)]",
          "animate-slide-up"
        )}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-between gap-4 border-b border-[var(--hairline)] px-5 py-4">
          {/* Grab handle, purely visual */}
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-[var(--hairline)]"
          />
          <h2 className="text-[21px] text-[var(--kani-green)]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={d.common.close}
            className="grid size-11 cursor-pointer place-items-center rounded-full
                       text-[var(--muted)] transition-colors hover:bg-black/5 hover:text-[var(--ink)]"
          >
            <svg viewBox="0 0 20 20" className="size-5" fill="none" aria-hidden="true">
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">
          {children}
        </div>

        {footer && (
          <div className="border-t border-[var(--hairline)] bg-[var(--card)] px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
