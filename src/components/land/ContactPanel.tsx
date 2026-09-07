import { ButtonAnchor } from "@/components/ui/Button";
import { InquiryForm } from "./InquiryForm";
import { FavouriteButton } from "./FavouriteButton";
import { formatPhoneLocal, toE164, toWhatsappNumber } from "@/lib/utils";
import { getDictionary, interpolate } from "@/lib/i18n";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import * as EnumLabel from "@/lib/i18n/enums";
import type { LandStatus } from "@/models/types";

/**
 * Two contact paths side by side, both reachable without scrolling on mobile:
 * call is one tap, enquiry is a form. WhatsApp appears only when a number is set.
 */
export function ContactPanel({
  landId,
  landTitle,
  refCode,
  ownerName,
  contactNumbers,
  whatsappNumber,
  status,
  locale = DEFAULT_LOCALE,
}: {
  landId: string;
  landTitle: string;
  refCode: string;
  ownerName: string;
  contactNumbers: string[];
  whatsappNumber?: string;
  status: LandStatus;
  locale?: Locale;
}) {
  const d = getDictionary(locale);
  const isGone = status === "sold" || status === "rented";
  const primary = contactNumbers[0];

  // A sold listing must not offer a call button — the dead end is converted
  // into a lead by the similar-listings row on the page instead.
  if (isGone) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--laterite)]/30 bg-[var(--laterite)]/6 p-6 text-center">
        <p className="font-serif text-[21px] text-[var(--laterite)]">
          {interpolate(d.land.thisLandIs, {
            status: EnumLabel.STATUS[locale][status].toLowerCase(),
          })}
        </p>
        <p className="mt-1.5 text-[15px] text-[var(--muted)]">
          {d.land.keptAsRecord}
        </p>
      </div>
    );
  }

  const waText = encodeURIComponent(
    interpolate(d.land.whatsappPrefill, { title: landTitle, ref: refCode })
  );

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--hairline)] bg-[var(--card)] p-5 md:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] uppercase tracking-wider text-[var(--muted)]">
            {d.land.listedBy}
          </p>
          <p className="truncate font-serif text-[21px] text-[var(--kani-green)]">
            {ownerName}
          </p>
        </div>
        <FavouriteButton landId={landId} title={landTitle} tone="solid" />
      </div>

      <div className="space-y-2.5">
        <ButtonAnchor
          href={`tel:${toE164(primary)}`}
          size="lg"
          fullWidth
          className="tabular"
        >
          <svg viewBox="0 0 20 20" className="size-5" fill="none" aria-hidden="true">
            <path d="M4.2 3h3l1.4 3.6L6.9 8.2a10 10 0 0 0 4.9 4.9l1.6-1.7L17 12.8v3a1.2 1.2 0 0 1-1.3 1.2A13.5 13.5 0 0 1 3 4.3 1.2 1.2 0 0 1 4.2 3Z"
                  stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          </svg>
          {formatPhoneLocal(primary)}
        </ButtonAnchor>

        {contactNumbers.slice(1).map((n) => (
          <ButtonAnchor
            key={n}
            href={`tel:${toE164(n)}`}
            variant="outline"
            size="md"
            fullWidth
            className="tabular"
          >
            {formatPhoneLocal(n)}
          </ButtonAnchor>
        ))}

        {whatsappNumber && (
          <ButtonAnchor
            href={`https://wa.me/${toWhatsappNumber(whatsappNumber)}?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
            size="lg"
            fullWidth
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
              <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.95L2 22.5l5.7-1.5A9.9 9.9 0 1 0 12.04 2Zm0 1.8a8.1 8.1 0 1 1-4.2 15.02l-.3-.18-3.38.89.9-3.3-.2-.32A8.1 8.1 0 0 1 12.04 3.8Zm4.66 10.2c-.25-.13-1.47-.72-1.7-.8-.23-.09-.4-.13-.56.12-.17.25-.64.8-.79.97-.14.16-.29.18-.54.06a6.63 6.63 0 0 1-3.3-2.88c-.25-.43.25-.4.71-1.32.08-.16.04-.3-.02-.42-.06-.13-.56-1.35-.77-1.84-.2-.48-.4-.42-.56-.42h-.47a.9.9 0 0 0-.66.3c-.22.25-.86.85-.86 2.07 0 1.21.88 2.39 1 2.55.13.17 1.73 2.65 4.2 3.71 1.56.68 2.18.73 2.96.62.47-.07 1.47-.6 1.68-1.19.2-.58.2-1.08.14-1.18-.06-.11-.23-.17-.48-.3Z" />
            </svg>
            {d.land.messageOnWhatsapp}
          </ButtonAnchor>
        )}
      </div>

      <div className="my-5 flex items-center gap-3 text-[13px] text-[var(--muted)]">
        <span className="h-px flex-1 bg-[var(--hairline)]" />
        {d.land.orSendMessage}
        <span className="h-px flex-1 bg-[var(--hairline)]" />
      </div>

      <InquiryForm landId={landId} landTitle={landTitle} compact />
    </div>
  );
}
