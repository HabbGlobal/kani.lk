import { LandSaleSign } from "./LandSaleSign";
import { formatPhoneLocal, toWhatsappNumber } from "@/lib/utils";

/**
 * Compact horizontal "have land to sell or rent" strip. A Server Component —
 * every link here is a plain anchor, so nothing needs client JS.
 */
export function ListLandCta({
  whatsappNumber,
}: {
  /** E.164 or local — normalised for the tel:/wa.me hrefs below. Omit or
   * pass an empty string when no contact number is configured yet; the
   * WhatsApp button is skipped rather than linking nowhere. */
  whatsappNumber?: string;
}) {
  const waNumber = whatsappNumber ? toWhatsappNumber(whatsappNumber) : "";
  const waDisplay = whatsappNumber ? formatPhoneLocal(whatsappNumber) : "";
  const waMessage = encodeURIComponent(
    "Hello Kani.lk, I would like to list my land for sale or rent."
  );
  const waHref = `https://wa.me/${waNumber}?text=${waMessage}`;

  return (
    <section className="container-kani pt-16 md:pt-20">
      <div
        className="group relative overflow-hidden rounded-[28px] on-dark
                   bg-[linear-gradient(135deg,var(--kani-green-deep),var(--kani-green))]"
      >
        {/* Decorative backdrop: gold glow behind the sign, faint contour
            lines across the field — both non-interactive and low-opacity. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div
            className="absolute left-[6%] top-1/2 size-[220px] -translate-y-1/2 rounded-full
                       bg-[var(--palmyra-gold)] opacity-[0.16] blur-3xl
                       transition-opacity duration-500 group-hover:opacity-[0.24]"
          />
          <svg
            className="absolute inset-0 h-full w-full opacity-[0.07]"
            viewBox="0 0 800 220"
            preserveAspectRatio="none"
            focusable="false"
          >
            <path
              d="M-20 60 Q200 10 420 60 T860 60"
              stroke="var(--palmyra-gold-soft)"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M-20 120 Q200 75 420 120 T860 120"
              stroke="var(--palmyra-gold-soft)"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M-20 180 Q200 140 420 180 T860 180"
              stroke="var(--palmyra-gold-soft)"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
        </div>

        <div
          className="relative flex w-full min-w-0 flex-col items-center gap-6 px-6 py-10
                     text-center sm:px-10 md:flex-row md:items-center md:gap-8
                     md:px-12 md:py-0 md:text-left lg:min-h-[190px]"
        >
          <LandSaleSign
            className="h-[110px] w-[110px] shrink-0 text-[var(--palmyra-gold-soft)] md:h-[130px] md:w-[130px]
                       transition-transform duration-500 [transition-timing-function:var(--ease-out)]
                       group-hover:-translate-y-1 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
          />

          <div className="w-full min-w-0 md:flex-1">
            <h2 className="text-balance text-[26px] text-white sm:text-[30px] md:text-[32px]">
              Have land to sell or rent out?
            </h2>
            <p className="mx-auto mt-2.5 max-w-xl text-pretty text-[15px] leading-relaxed text-white/75 sm:text-[16px] md:mx-0">
              Reach genuine buyers and tenants across the North and East. Share
              your land details and photos, and we&rsquo;ll guide you through
              the listing process.
            </p>
          </div>

          <div
            className="flex w-full min-w-0 flex-col gap-3 sm:w-auto sm:flex-row md:shrink-0"
          >
            <a
              href="/contact?intent=list-land"
              aria-label="List your land — start the listing process"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] sm:w-auto
                         bg-[var(--palmyra-gold)] px-6 text-[15px] font-semibold text-[var(--kani-green-deep)]
                         shadow-[0_4px_14px_rgba(0,0,0,0.22)]
                         transition-[background-color,transform] duration-200 [transition-timing-function:var(--ease-out)]
                         hover:-translate-y-0.5 hover:bg-[var(--palmyra-gold-soft)]
                         active:translate-y-0 active:scale-[0.97]
                         focus-visible:outline-2 focus-visible:outline-offset-2
                         motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              <svg viewBox="0 0 20 20" className="size-[18px] shrink-0" fill="none" aria-hidden="true">
                <path
                  d="M4 9.5 10 4l6 5.5M5.5 8.5V16h9V8.5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M8.2 16v-4h3.6v4" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
              </svg>
              List your land
            </a>

            {waNumber && (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Message us on WhatsApp at ${waDisplay} about listing your land`}
                className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-[var(--radius-pill)] sm:w-auto
                           border border-white/25 bg-transparent px-6 text-[15px] font-medium text-white
                           tabular
                           transition-[background-color,border-color,transform] duration-200 [transition-timing-function:var(--ease-out)]
                           hover:border-[var(--palmyra-gold-soft)]/60 hover:bg-white/8
                           active:scale-[0.97]
                           focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <svg viewBox="0 0 24 24" className="size-[18px] shrink-0 text-[#25D366]" fill="currentColor" aria-hidden="true">
                  <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.77.46 3.44 1.27 4.89L2 22l5.25-1.28A9.96 9.96 0 0 0 12.04 22c5.52 0 10-4.48 10-10s-4.48-10-10-10Zm5.85 14.27c-.25.7-1.24 1.28-2.02 1.44-.55.11-1.26.2-3.66-.79-3.07-1.27-5.05-4.4-5.2-4.6-.15-.2-1.24-1.65-1.24-3.15 0-1.5.79-2.23 1.07-2.54.28-.31.6-.38.8-.38h.58c.19 0 .43-.03.68.52.25.55.85 1.9.92 2.04.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.3.76 1.25 1.63 2.02 1.12 1 2.06 1.31 2.36 1.46.3.15.47.13.65-.08.18-.2.75-.87.95-1.17.2-.3.4-.25.68-.15.28.1 1.76.83 2.06.98.3.15.5.23.57.36.07.13.07.75-.18 1.45Z" />
                </svg>
                {waDisplay}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
