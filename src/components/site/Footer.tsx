import { Children } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { AsciiWave } from "./AsciiWave";
import { getTaxonomies, getSettings } from "@/lib/queries";
import { formatPhoneLocal, toE164 } from "@/lib/utils";
import { getDictionary, interpolate } from "@/lib/i18n";
import { localeHref, type Locale } from "@/lib/i18n/config";
import { localizedName } from "@/lib/i18n/localized";

export async function Footer({ locale }: { locale: Locale }) {
  const [taxonomies, settings] = await Promise.all([
    getTaxonomies(),
    getSettings(),
  ]);

  const d = getDictionary(locale);
  /** Every footer link has to carry the locale prefix. */
  const href = (path: string) => localeHref(path, locale);

  const phone = String(settings.contactPhone ?? "");
  const email = String(settings.contactEmail ?? "");

  const social = [
    { href: settings.facebookUrl, label: "Facebook" },
    { href: settings.instagramUrl, label: "Instagram" },
    { href: settings.youtubeUrl, label: "YouTube" },
    { href: settings.tiktokUrl, label: "TikTok" },
  ].filter((s) => typeof s.href === "string" && s.href.length > 0) as {
    href: string;
    label: string;
  }[];

  return (
    <footer className="relative mt-12 overflow-hidden bg-[var(--kani-green-deep)] text-white/70 on-dark">
      <AsciiWave color="#d8bd82" speed={0.6} opacity={0.22} />
      {/* Fades the wave out from the top so the page edge stays clean. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b
                   from-[var(--kani-green-deep)] via-transparent to-[var(--kani-green-deep)]/85"
      />

      <div className="relative">
        {/* Masthead — the wordmark and the one line that says what this is. */}
        <div className="container-kani flex flex-col gap-3 border-b border-white/10 py-6
                        md:flex-row md:items-end md:justify-between">
          <div>
            <Logo onDark withTagline tagline={d.common.tagline} />
            <p className="mt-2.5 max-w-md text-[14px] leading-relaxed text-white/75">
              {d.footer.blurb}
            </p>
          </div>

          {social.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {social.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 items-center rounded-[var(--radius-pill)]
                               border border-white/15 px-4 text-sm text-white/85
                               transition-colors duration-200 hover:border-white/40 hover:bg-white/10 hover:text-white"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="container-kani grid gap-6 py-7 sm:grid-cols-2 lg:grid-cols-4">
          <FooterColumn id="foot-browse" title={d.footer.browse}>
            <FooterLink href={href("/lands")}>{d.footer.allListings}</FooterLink>
            <FooterLink href={href("/for-sale")}>{d.footer.landForSale}</FooterLink>
            <FooterLink href={href("/for-rent")}>{d.footer.landForRent}</FooterLink>
            <FooterLink href={href("/districts")}>{d.footer.allDistricts}</FooterLink>
            <FooterLink href={href("/favourites")}>{d.footer.savedLands}</FooterLink>
          </FooterColumn>

          <FooterColumn id="foot-types" title={d.footer.popularSearches}>
            {taxonomies.landTypes.slice(0, 6).map((t) => (
              <FooterLink key={t._id} href={href(`/lands?landType=${t.slug}`)}>
                {localizedName(t, locale)}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn id="foot-company" title="kani.lk">
            <FooterLink href={href("/about")}>{d.footer.aboutKani}</FooterLink>
            <FooterLink href={href("/contact")}>{d.footer.contactUs}</FooterLink>
            <FooterLink href={href("/terms")}>{d.footer.terms}</FooterLink>
            <FooterLink href={href("/privacy")}>{d.footer.privacy}</FooterLink>
          </FooterColumn>

          {/* Contact is the point of the whole site, so it gets real weight
              rather than another list of small links. */}
          <section aria-labelledby="foot-contact">
            <h2
              id="foot-contact"
              className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--palmyra-gold-soft)]"
            >
              {d.footer.talkToUs}
            </h2>
            <div className="mt-3 space-y-1.5 text-[14.5px]">
              {phone && (
                <a
                  href={`tel:${toE164(phone)}`}
                  className="block tabular text-[19px] font-medium leading-tight text-white
                             transition-colors duration-200 hover:text-[var(--palmyra-gold-soft)]"
                >
                  {formatPhoneLocal(phone)}
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="block text-white/80 transition-colors duration-200 hover:text-white"
                >
                  {email}
                </a>
              )}
              {settings.officeAddress ? (
                <p className="text-white/70">{String(settings.officeAddress)}</p>
              ) : null}
              {settings.officeHours ? (
                <p className="text-white/50">{String(settings.officeHours)}</p>
              ) : null}
            </div>
          </section>
        </div>

        <div className="border-t border-white/10">
          <div className="container-kani flex flex-col gap-1.5 py-3.5 text-[12.5px] text-white/50
                          md:flex-row md:items-center md:justify-between">
            <p>{interpolate(d.footer.rights, { year: new Date().getFullYear() })}</p>
            <p>{d.footer.legalNote}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <nav aria-labelledby={id}>
      <h2
        id={id}
        className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--palmyra-gold-soft)]"
      >
        {title}
      </h2>
      <ul className="mt-2.5 space-y-1.5 text-[14.5px]">
        {/* Children.map (not Array.isArray) — a column with exactly one
            static child (rather than one produced by .map) arrives as a bare
            element, not an array, so the old isArray check silently dropped
            the <li> wrapper for that case. Children.map handles a single
            child, multiple children, and an array of children uniformly. */}
        {Children.map(children, (child, i) => <li key={i}>{child}</li>)}
      </ul>
    </nav>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-block py-0.5 transition-colors duration-200 hover:text-white"
    >
      {children}
    </Link>
  );
}
