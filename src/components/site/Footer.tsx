import Link from "next/link";
import { Logo } from "./Logo";
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
    <footer className="mt-24 bg-[var(--kani-green-deep)] text-white/75 on-dark">
      <div className="container-kani grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Logo onDark withTagline />
          <p className="mt-5 max-w-xs text-[15px] leading-relaxed">
            Land and property across the Northern and Eastern provinces of
            Sri Lanka. Every listing carries the owner&rsquo;s own number.
          </p>
          {social.length > 0 && (
            <ul className="mt-5 flex gap-2">
              {social.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 items-center rounded-[var(--radius-pill)] bg-white/10 px-4
                               text-[14px] text-white transition-colors hover:bg-white/18"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <nav aria-labelledby="foot-browse">
          <h2 id="foot-browse" className="mb-4 text-[15px] font-semibold uppercase tracking-wider text-white">
            Browse
          </h2>
          <ul className="space-y-2.5 text-[15px]">
            <li><FooterLink href="/lands">All listings</FooterLink></li>
            <li><FooterLink href="/for-sale">Land for sale</FooterLink></li>
            <li><FooterLink href="/for-rent">Land and property for rent</FooterLink></li>
            <li><FooterLink href="/districts">All districts</FooterLink></li>
            <li><FooterLink href="/favourites">Saved lands</FooterLink></li>
          </ul>
        </nav>

        <nav aria-labelledby="foot-districts">
          <h2 id="foot-districts" className="mb-4 text-[15px] font-semibold uppercase tracking-wider text-white">
            Districts
          </h2>
          <ul className="space-y-2.5 text-[15px]">
            {districts.map((d) => (
              <li key={d._id}>
                <FooterLink href={`/districts/${d.slug}`}>
                  Land in {d.name}
                  <span className="ml-1.5 text-white/45">{d.count}</span>
                </FooterLink>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="mb-4 text-[15px] font-semibold uppercase tracking-wider text-white">
            Contact
          </h2>
          <ul className="space-y-2.5 text-[15px]">
            {phone && (
              <li>
                <a href={`tel:${toE164(phone)}`} className="tabular transition-colors hover:text-white">
                  {formatPhoneLocal(phone)}
                </a>
              </li>
            )}
            {email && (
              <li>
                <a href={`mailto:${email}`} className="transition-colors hover:text-white">
                  {email}
                </a>
              </li>
            )}
            {settings.officeAddress && <li>{String(settings.officeAddress)}</li>}
            {settings.officeHours && (
              <li className="text-white/55">{String(settings.officeHours)}</li>
            )}
          </ul>
          <ul className="mt-6 space-y-2.5 text-[15px]">
            <li><FooterLink href="/about">About kani.lk</FooterLink></li>
            <li><FooterLink href="/terms">Terms of use</FooterLink></li>
            <li><FooterLink href="/privacy">Privacy policy</FooterLink></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-kani flex flex-col gap-2 py-6 text-[14px] text-white/55 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} kani.lk. All rights reserved.</p>
          <p>
            Verify every deed and survey plan with a lawyer before you pay.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-block py-0.5 transition-colors hover:text-white">
      {children}
    </Link>
  );
}
