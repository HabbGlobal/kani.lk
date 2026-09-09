import { ButtonAnchor } from "@/components/ui/Button";
import { toE164, toWhatsappNumber } from "@/lib/utils";
import { getDictionary, interpolate } from "@/lib/i18n";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import type { LandStatus } from "@/models/types";

/**
 * Fixed call/WhatsApp bar for phones. `ContactPanel` sits in the right rail on
 * desktop, but is the second grid child on mobile — it renders after the
 * gallery, specs, description and map, which on a direct-contact site put the
 * one thing visitors come to do at the bottom of a long scroll. This keeps it
 * reachable everywhere on the page instead.
 *
 * Hidden at `lg` and up, where `ContactPanel` is already visible without
 * scrolling. Hidden entirely on sold/rented listings, matching `ContactPanel`'s
 * own gating — there's no call to take.
 */
export function MobileContactBar({
  landTitle,
  refCode,
  contactNumbers,
  whatsappNumber,
  status,
  locale = DEFAULT_LOCALE,
}: {
  landTitle: string;
  refCode: string;
  contactNumbers: string[];
  whatsappNumber?: string;
  status: LandStatus;
  locale?: Locale;
}) {
  const isGone = status === "sold" || status === "rented";
  if (isGone) return null;

  const d = getDictionary(locale);
  const primary = contactNumbers[0];
  const waText = encodeURIComponent(
    interpolate(d.land.whatsappPrefill, { title: landTitle, ref: refCode })
  );

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-[var(--hairline)]
                 bg-[var(--card)] p-3 shadow-[0_-8px_24px_rgba(10,44,30,0.12)] lg:hidden"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
    >
      {whatsappNumber && (
        <ButtonAnchor
          href={`https://wa.me/${toWhatsappNumber(whatsappNumber)}?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          variant="outline"
          size="lg"
          className="flex-1"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
            <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.95L2 22.5l5.7-1.5A9.9 9.9 0 1 0 12.04 2Zm0 1.8a8.1 8.1 0 1 1-4.2 15.02l-.3-.18-3.38.89.9-3.3-.2-.32A8.1 8.1 0 0 1 12.04 3.8Zm4.66 10.2c-.25-.13-1.47-.72-1.7-.8-.23-.09-.4-.13-.56.12-.17.25-.64.8-.79.97-.14.16-.29.18-.54.06a6.63 6.63 0 0 1-3.3-2.88c-.25-.43.25-.4.71-1.32.08-.16.04-.3-.02-.42-.06-.13-.56-1.35-.77-1.84-.2-.48-.4-.42-.56-.42h-.47a.9.9 0 0 0-.66.3c-.22.25-.86.85-.86 2.07 0 1.21.88 2.39 1 2.55.13.17 1.73 2.65 4.2 3.71 1.56.68 2.18.73 2.96.62.47-.07 1.47-.6 1.68-1.19.2-.58.2-1.08.14-1.18-.06-.11-.23-.17-.48-.3Z" />
          </svg>
          <span className="sr-only sm:not-sr-only">{d.land.messageOnWhatsapp}</span>
        </ButtonAnchor>
      )}

      <ButtonAnchor
        href={`tel:${toE164(primary)}`}
        size="lg"
        className="flex-[2] tabular"
      >
        <svg viewBox="0 0 20 20" className="size-5" fill="none" aria-hidden="true">
          <path d="M4.2 3h3l1.4 3.6L6.9 8.2a10 10 0 0 0 4.9 4.9l1.6-1.7L17 12.8v3a1.2 1.2 0 0 1-1.3 1.2A13.5 13.5 0 0 1 3 4.3 1.2 1.2 0 0 1 4.2 3Z"
                stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
        {d.land.callNow}
      </ButtonAnchor>
    </div>
  );
}
