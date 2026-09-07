import type { Metadata, Viewport } from "next";
import { Newsreader, Public_Sans, Noto_Sans_Tamil } from "next/font/google";
import { cookies } from "next/headers";
import { HTML_LANG, LOCALE_COOKIE, toLocale } from "@/lib/i18n/config";
import "./globals.css";

/** Headings — a serif reads like a deed and echoes the wordmark. */
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

/** UI and body — neutral, excellent at 15–17px on Android. */
const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/** Tamil is the default locale, so this face is on the critical path now. */
const notoTamil = Noto_Sans_Tamil({
  variable: "--font-noto-tamil",
  subsets: ["tamil"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "kani.lk — Land for sale and rent in Northern & Eastern Sri Lanka",
    template: "%s | kani.lk",
  },
  description:
    "Browse land, paddy fields, coconut estates and houses for sale or rent across Vavuniya, Mannar, Jaffna, Batticaloa, Trincomalee and Mullaitivu. Contact owners directly.",
  applicationName: "kani.lk",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    shortcut: "/favicon.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    siteName: "kani.lk",
    locale: "en_LK",
    url: siteUrl,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#12452F",
  width: "device-width",
  initialScale: 1,
  // Never disable zoom — many of these users need it.
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // This layout sits above the [lang] segment and so cannot read the route
  // param. The proxy keeps this cookie in step with the URL on every public
  // request, which makes it the right source for the document language.
  const locale = toLocale((await cookies()).get(LOCALE_COOKIE)?.value);

  return (
    <html
      lang={HTML_LANG[locale]}
      className={`${newsreader.variable} ${publicSans.variable} ${notoTamil.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-bone text-ink">{children}</body>
    </html>
  );
}
