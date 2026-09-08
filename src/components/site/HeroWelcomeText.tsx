import { Lobster_Two, Comfortaa } from "next/font/google";
import { ScrollReveal } from "./ScrollReveal";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";

/** The script face — carries the warmth of "welcome", used sparingly. */
const lobsterTwo = Lobster_Two({
  variable: "--font-lobster-two",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

/** The geometric face — grounds the script face so the pairing reads as
 * considered rather than decorative. */
const comfortaa = Comfortaa({
  variable: "--font-comfortaa",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

/**
 * The hero's welcome line. On English, a short Comfortaa eyebrow ("Welcome to
 * kani.lk") sits above the admin-editable headline, set in Lobster Two — one
 * pairing, two roles: geometric sans for the greeting, script serif for the
 * promise. Lobster Two and Comfortaa are Latin-only faces, so on Tamil the
 * eyebrow is dropped (the admin's Tamil headline already opens with its own
 * "welcome to kani.lk") and the headline renders in the Tamil face loaded
 * globally in the root layout instead.
 */
export function HeroWelcomeText({
  title,
  subtitle,
  locale = DEFAULT_LOCALE,
}: {
  title: string;
  subtitle?: string;
  locale?: Locale;
}) {
  const isTamil = locale === "ta";

  return (
    <div className={`${lobsterTwo.variable} ${comfortaa.variable}`}>
      {!isTamil && (
        <p
          className="text-[15px] font-bold uppercase tracking-[0.16em] text-white sm:text-[16px]"
          style={{
            fontFamily: "var(--font-comfortaa), var(--font-sans)",
            textShadow: "0 1px 3px rgba(10, 44, 30, 0.65), 0 1px 12px rgba(10, 44, 30, 0.35)",
          }}
        >
          Welcome to{" "}
          <span style={{ color: "var(--palmyra-gold-soft)" }}>kani</span>
          <span style={{ color: "var(--paddy)" }}>.lk</span>
        </p>
      )}

      <h1
        className={`leading-[1.15] text-white ${
          isTamil
            ? "text-[30px] sm:text-[38px] lg:text-[46px]"
            : "mt-1 text-[38px] sm:text-[50px] lg:text-[64px]"
        }`}
        style={{
          fontFamily: isTamil
            ? "var(--font-tamil)"
            : "var(--font-lobster-two), var(--font-serif)",
        }}
      >
        {/* Per-word reveal: each word is masked in its own overflow-hidden
            box and the inner span slides up from below on load — pure CSS
            (kani-word-reveal, globals.css), so this stays a Server Component
            with no client JS or animation library. The gold-accent word match
            below is English-only vocabulary ("trust", "north", "east") and
            simply never matches Tamil text, which reveals in a single color —
            that is the correct behavior until the accent words are localized. */}
        {title.split(" ").map((word, i, words) => {
          const bare = word.replace(/[^a-z]/gi, "").toLowerCase();
          const isAccent = !isTamil && ["trust", "north", "east"].includes(bare);
          return (
          <span key={i} className="inline-block overflow-hidden align-top">
            <span
              className="kani-word-reveal inline-block whitespace-pre"
              style={{
                animationDelay: `${i * 70}ms`,
                color: isAccent ? "var(--palmyra-gold-soft)" : undefined,
              }}
            >
              {word}
              {i < words.length - 1 ? " " : ""}
            </span>
          </span>
          );
        })}
      </h1>

      {subtitle && (
        <ScrollReveal
          startWhen
          staggerMs={22}
          baseRotation={3}
          className="mt-4 max-w-2xl text-[16px] leading-relaxed text-white/85 md:text-[18px]"
          style={{ fontFamily: isTamil ? "var(--font-tamil)" : "var(--font-comfortaa), var(--font-sans)" }}
        >
          {subtitle}
        </ScrollReveal>
      )}
    </div>
  );
}
