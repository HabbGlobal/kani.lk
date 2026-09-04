import type { Metadata } from "next";
import { InquiryForm } from "@/components/land/InquiryForm";
import { Card } from "@/components/ui/Card";
import { getSettings } from "@/lib/queries";
import { formatPhoneLocal, toE164, toWhatsappNumber } from "@/lib/utils";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Contact kani.lk",
  description:
    "Call or message kani.lk about a listing, or to put your own land in front of buyers across the Northern and Eastern provinces.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const settings = await getSettings();
  const phone = String(settings.contactPhone ?? "");
  const phoneAlt = String(settings.contactPhoneAlt ?? "");
  const email = String(settings.contactEmail ?? "");
  const whatsapp = String(settings.contactWhatsapp ?? "");

  return (
    <div className="container-kani py-8 md:py-12">
      <header className="mb-8 max-w-2xl">
        <h1 className="text-[27px] text-[var(--kani-green)] md:text-[34px]">
          Talk to us
        </h1>
        <p className="mt-2 text-[17px] leading-relaxed text-[var(--muted)]">
          Whether you are looking for land or have land to list, call us or send
          a message. We answer in Tamil, Sinhala and English.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <Card className="p-6 md:p-8">
          <h2 className="mb-5 text-[21px] text-[var(--kani-green)]">
            Send us a message
          </h2>
          <InquiryForm source="contact" />
        </Card>

        <aside className="space-y-4">
          {phone && (
            <ContactRow
              label="Call us"
              href={`tel:${toE164(phone)}`}
              value={formatPhoneLocal(phone)}
              icon={
                <path d="M4.2 3h3l1.4 3.6L6.9 8.2a10 10 0 0 0 4.9 4.9l1.6-1.7L17 12.8v3a1.2 1.2 0 0 1-1.3 1.2A13.5 13.5 0 0 1 3 4.3 1.2 1.2 0 0 1 4.2 3Z" />
              }
            />
          )}
          {phoneAlt && (
            <ContactRow
              label="Alternative number"
              href={`tel:${toE164(phoneAlt)}`}
              value={formatPhoneLocal(phoneAlt)}
              icon={
                <path d="M4.2 3h3l1.4 3.6L6.9 8.2a10 10 0 0 0 4.9 4.9l1.6-1.7L17 12.8v3a1.2 1.2 0 0 1-1.3 1.2A13.5 13.5 0 0 1 3 4.3 1.2 1.2 0 0 1 4.2 3Z" />
              }
            />
          )}
          {whatsapp && (
            <ContactRow
              label="WhatsApp"
              href={`https://wa.me/${toWhatsappNumber(whatsapp)}`}
              value={formatPhoneLocal(whatsapp)}
              external
              icon={<path d="M4 16l1-3a7 7 0 1 1 3 2.6Z" />}
            />
          )}
          {email && (
            <ContactRow
              label="Email"
              href={`mailto:${email}`}
              value={email}
              icon={
                <>
                  <rect x="2.5" y="4.5" width="15" height="11" rx="1.8" />
                  <path d="M3 6l7 5 7-5" />
                </>
              }
            />
          )}

          {settings.officeAddress && (
            <Card className="p-5">
              <h2 className="mb-1 text-[13px] uppercase tracking-wider text-[var(--muted)]">
                Office
              </h2>
              <address className="not-italic text-[16px] leading-relaxed text-[var(--ink)]">
                {String(settings.officeAddress)}
              </address>
              {settings.officeHours && (
                <p className="mt-2 text-[15px] text-[var(--muted)]">
                  {String(settings.officeHours)}
                </p>
              )}
            </Card>
          )}

          <Card className="border-[var(--palmyra-gold)]/40 bg-[var(--palmyra-gold)]/8 p-5">
            <h2 className="mb-1.5 font-serif text-[19px] text-[var(--kani-green)]">
              Have land to list?
            </h2>
            <p className="text-[15px] leading-relaxed text-[var(--ink)]">
              Send us the extent, the district, the deed type and a few
              photographs. We will come back to you with what it needs to sell
              and get it published.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function ContactRow({
  label,
  href,
  value,
  icon,
  external = false,
}: {
  label: string;
  href: string;
  value: string;
  icon: React.ReactNode;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--hairline)]
                 bg-[var(--card)] p-5 transition-[border-color,transform] duration-200
                 [transition-timing-function:var(--ease-out)]
                 hover:border-[var(--kani-green)]/40 hover:-translate-y-0.5"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--kani-green)]/10
                       text-[var(--kani-green)]">
        <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor"
             strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
          {icon}
        </svg>
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] uppercase tracking-wider text-[var(--muted)]">
          {label}
        </span>
        <span className="tabular block truncate text-[17px] font-medium text-[var(--ink)]">
          {value}
        </span>
      </span>
    </a>
  );
}
