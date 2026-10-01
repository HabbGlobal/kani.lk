import { formatPhoneLocal, toE164 } from "@/lib/utils";
import { getDictionary, interpolate } from "@/lib/i18n";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";

/**
 * Premium "advertise with us" contact card. Built from the Settings contact
 * number — renders nothing once that's unconfigured, since there'd be
 * nothing to call.
 *
 * Two distinct layouts below, not one shared responsive shape:
 *
 * - `sm` and up (unchanged from the original design): floats, absolutely
 *   positioned, over the hero photo's empty right-hand area.
 * - Below `sm`: the photo runs edge to edge on a phone and the welcome text
 *   already claims the full width, so floating a card over it either
 *   overlaps the headline or forces a tall fixed offset. Instead this is a
 *   compact card in normal document flow (`position: relative`, implicit —
 *   no `absolute`), rendered by the page just below the stat pills, sized
 *   to its own content rather than a fixed height so it works for both the
 *   shorter English copy and the longer Tamil copy without clipping either.
 */
export function HeroPublishCta({
  phone,
  locale = DEFAULT_LOCALE,
}: {
  /** E.164 or local; omit when no contact number is configured yet. */
  phone?: string;
  locale?: Locale;
}) {
  if (!phone) return null;

  const d = getDictionary(locale);
  const display = formatPhoneLocal(phone);
  const href = `tel:${toE164(phone)}`;
  const label = interpolate(d.home.heroPublishAria, { phone: display });

  return (
    <a
      href={href}
      aria-label={label}
      className="group hidden w-auto flex-col gap-4 rounded-2xl
                 border border-white/15 bg-black/35 p-5 text-left on-dark shadow-[0_8px_32px_rgba(0,0,0,0.35)]
                 backdrop-blur-xl
                 transition-[background-color,border-color,transform] duration-200 [transition-timing-function:var(--ease-out)]
                 hover:border-white/25 hover:bg-black/40
                 focus-visible:outline-2 focus-visible:outline-offset-2
                 sm:absolute sm:inset-x-auto sm:right-6 sm:top-1/2 sm:z-10 sm:flex sm:w-[280px] sm:-translate-y-1/2
                 sm:hover:-translate-y-[calc(50%+2px)]
                 xl:right-10 xl:w-[300px]"
    >
      {/* Top row: gold phone icon + "we're here to help" status badge. */}
      <div className="flex items-center gap-2.5">
        <PhoneIcon className="size-10 shrink-0" />
        <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-white/15 bg-white/5 px-2.5 py-1">
          <span className="relative flex size-1.5 shrink-0">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--paddy)] opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-[var(--paddy)]" />
          </span>
          <span className="text-[11.5px] font-medium leading-none text-white/80">
            {d.home.heroPublishBadge}
          </span>
        </span>
      </div>

      {/* Heading — the strongest text in the card. */}
      <h2 className="text-[20px] font-semibold leading-[1.25] text-white">
        {d.home.heroPublishCta}
      </h2>

      {/* Supporting line. */}
      <p className="text-[13px] leading-relaxed text-white/70">
        {d.home.heroPublishSub}
      </p>

      <hr className="border-t border-white/12" />

      {/* Phone row — the visually prominent number. */}
      <div className="flex items-center gap-2">
        <PhoneGlyph className="size-4 shrink-0 text-[var(--palmyra-gold-soft)]" />
        <span className="tabular text-[21px] font-semibold leading-none text-white">
          {display}
        </span>
      </div>

      {/* CTA button. */}
      <span
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-[var(--radius-pill)]
                   bg-[var(--palmyra-gold)] px-4 py-2.5 text-[13.5px] font-semibold text-[var(--kani-green-deep)]
                   transition-colors duration-200 group-hover:bg-[var(--palmyra-gold-soft)]"
      >
        {d.home.heroPublishButton}
        <ArrowGlyph className="size-3.5 shrink-0" />
      </span>

      {/* Availability footnote. */}
      <p className="tabular text-center text-[11px] text-white/50">
        {d.home.heroPublishHours}
      </p>
    </a>
  );
}

/**
 * Compact mobile/tablet counterpart — see the file-level comment for why
 * this is a separate, normal-flow component rather than a breakpoint
 * variant of {@link HeroPublishCta}'s own markup. Rendered by the page just
 * below the stat pills; hidden from `sm` up, where the floating card above
 * takes over. Auto height throughout — no fixed card height, so Tamil's
 * naturally longer copy is never clipped.
 */
HeroPublishCta.Compact = function HeroPublishCtaCompact({
  phone,
  locale = DEFAULT_LOCALE,
}: {
  phone?: string;
  locale?: Locale;
}) {
  if (!phone) return null;

  const d = getDictionary(locale);
  const display = formatPhoneLocal(phone);
  const href = `tel:${toE164(phone)}`;
  const label = interpolate(d.home.heroPublishAria, { phone: display });

  return (
    <a
      href={href}
      aria-label={label}
      className="group flex w-full flex-col gap-2 rounded-2xl border border-white/15 bg-black/55
                 p-4 text-left on-dark shadow-[0_8px_24px_rgba(0,0,0,0.3)] backdrop-blur-xl
                 transition-colors duration-200 hover:bg-black/60
                 focus-visible:outline-2 focus-visible:outline-offset-2
                 sm:hidden"
    >
      {/* Top row: small phone icon + compact status badge. */}
      <div className="flex items-center gap-2">
        <PhoneIcon className="size-8 shrink-0" />
        <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-white/20 bg-white/10 px-2 py-0.5">
          <span className="relative flex size-1.5 shrink-0">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--paddy)] opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-[var(--paddy)]" />
          </span>
          <span className="text-[10.5px] font-medium leading-none text-white/80">
            {d.home.heroPublishBadge}
          </span>
        </span>
      </div>

      <h2 className="text-[18px] font-semibold leading-[1.25] text-white">
        {d.home.heroPublishCta}
      </h2>

      <p className="text-[11.5px] leading-[1.45] text-white/70">
        {d.home.heroPublishSub}
      </p>

      <hr className="border-t border-white/12" />

      {/* Phone + CTA share one row — the main lever for keeping this card
          short. Wraps onto its own lines only if the viewport is too
          narrow to fit both (down to 320px), rather than ever scrolling. */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          <PhoneGlyph className="size-3.5 shrink-0 text-[var(--palmyra-gold-soft)]" />
          <span className="tabular text-[15px] font-semibold leading-none text-white">
            {display}
          </span>
        </span>

        <span
          className="inline-flex shrink-0 items-center gap-1 rounded-[var(--radius-pill)]
                     bg-[var(--palmyra-gold)] px-3.5 py-2 text-[12.5px] font-semibold leading-none
                     text-[var(--kani-green-deep)] transition-colors duration-200
                     group-hover:bg-[var(--palmyra-gold-soft)]"
        >
          {d.home.heroPublishButton}
          <ArrowGlyph className="size-3 shrink-0" />
        </span>
      </div>

      <p className="tabular text-[9.5px] text-white/50">
        {d.home.heroPublishHours}
      </p>
    </a>
  );
};

function PhoneIcon({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`grid place-items-center rounded-full bg-[var(--palmyra-gold)] text-[var(--kani-green-deep)] ${className ?? ""}`}
    >
      <PhoneGlyph className="size-[18px]" />
    </span>
  );
}

function PhoneGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" aria-hidden="true">
      <path
        d="M5.5 3.5h2.2l1.1 3.3-1.6 1.3a9 9 0 0 0 4.7 4.7l1.3-1.6 3.3 1.1v2.2c0 .8-.7 1.5-1.5 1.4C6.4 15.4 1.8 10.8 1.5 4.9c0-.8.6-1.4 1.5-1.4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
