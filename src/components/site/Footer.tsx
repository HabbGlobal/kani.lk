import Link from "next/link";
import { Logo } from "./Logo";
import { AsciiWave } from "./AsciiWave";
import { getDistrictsWithCounts, getSettings } from "@/lib/queries";
import { formatPhoneLocal, toE164 } from "@/lib/utils";

export async function Footer() {
  const [districts, settings] = await Promise.all([
    getDistrictsWithCounts(),
    getSettings(),
  ]);

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
    <footer className="relative mt-16 overflow-hidden bg-[var(--kani-green-deep)] text-white/70 on-dark">
      <AsciiWave color="#d8bd82" speed={0.6} opacity={0.22} />
      {/* Fades the wave out from the top so the page edge stays clean. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b
                   from-[var(--kani-green-deep)] via-transparent to-[var(--kani-green-deep)]/85"
      />

      <div className="relative">
        {/* Masthead — the wordmark and the one line that says what this is. */}
        <div className="container-kani flex flex-col gap-4 border-b border-white/10 py-8
                        md:flex-row md:items-end md:justify-between">
          <div>
            <Logo onDark withTagline />
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/75">
              Land and property across the Northern and Eastern provinces of
              Sri Lanka. Every listing carries the owner&rsquo;s own number.
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
                               border border-white/15 px-5 text-[14px] text-white/85
                               transition-colors duration-200 hover:border-white/40 hover:bg-white/10 hover:text-white"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="container-kani grid gap-8 py-9 sm:grid-cols-2 lg:grid-cols-4">
          <FooterColumn id="foot-browse" title="Browse">
            <FooterLink href="/lands">All listings</FooterLink>
            <FooterLink href="/for-sale">Land for sale</FooterLink>
            <FooterLink href="/for-rent">Land and property for rent</FooterLink>
            <FooterLink href="/districts">All districts</FooterLink>
            <FooterLink href="/favourites">Saved lands</FooterLink>
          </FooterColumn>

          <FooterColumn id="foot-districts" title="Districts">
            {districts.map((d) => (
              <FooterLink key={d._id} href={`/districts/${d.slug}`}>
                Land in {d.name}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn id="foot-company" title="kani.lk">
            <FooterLink href="/about">About kani.lk</FooterLink>
            <FooterLink href="/contact">Contact us</FooterLink>
            <FooterLink href="/terms">Terms of use</FooterLink>
            <FooterLink href="/privacy">Privacy policy</FooterLink>
          </FooterColumn>

          {/* Contact is the point of the whole site, so it gets real weight
              rather than another list of small links. */}
          <section aria-labelledby="foot-contact">
            <h2
              id="foot-contact"
              className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--palmyra-gold-soft)]"
            >
              Talk to us
            </h2>
            <div className="mt-3 space-y-2 text-[15px]">
              {phone && (
                <a
                  href={`tel:${toE164(phone)}`}
                  className="block tabular text-[22px] font-medium leading-tight text-white
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
          <div className="container-kani flex flex-col gap-2 py-4 text-[13px] text-white/50
                          md:flex-row md:items-center md:justify-between">
            <p>© {new Date().getFullYear()} kani.lk. All rights reserved.</p>
            <p>Verify every deed and survey plan with a lawyer before you pay.</p>
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
      <ul className="mt-3 space-y-2 text-[15px]">
        {Array.isArray(children)
          ? children.map((child, i) => <li key={i}>{child}</li>)
          : <li>{children}</li>}
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
