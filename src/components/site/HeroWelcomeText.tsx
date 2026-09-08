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
 * The hero's welcome line — two entirely separate treatments, one per locale.
 *
 * English keeps its original design untouched: a Comfortaa eyebrow ("Welcome
 * to kani.lk") over a large Lobster Two headline with a per-word reveal.
 *
 * Tamil gets its own layout rather than the English one restyled. Lobster Two
 * and Comfortaa are Latin-only, and the Tamil copy runs long enough that the
 * English sizes overflow the hero, so Tamil renders as a gold greeting line, a
 * short gold rule, and a smaller supporting headline, all in the Noto Tamil
 * face loaded globally in the root layout. The per-word reveal is dropped
 * there too: it splits on spaces, which fragments Tamil words mid-phrase.
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

  if (isTamil) {
    // The Tamil headline is written as two sentences — a greeting
    // ("KANI.LK-க்கு வரவேற்கிறோம்.") and the promise that follows. Splitting
    // on that first full stop lets each play its own role instead of running
    // together into one oversized five-line block. If an admin writes a
    // single-sentence Tamil headline, `promise` is empty and the greeting
    // simply carries the hero on its own.
    const [greeting, ...rest] = title.split(/(?<=\.)\s+/);
    const promise = rest.join(" ").trim();

    return (
      <div style={{ fontFamily: "var(--font-tamil)" }}>
        <p
          className="text-[22px] font-semibold leading-[1.3] sm:text-[27px] lg:text-[31px]"
          style={{
            color: "var(--palmyra-gold-soft)",
            textShadow:
              "0 1px 3px rgba(10, 44, 30, 0.65), 0 1px 12px rgba(10, 44, 30, 0.35)",
          }}
        >
          {greeting}
        </p>

        {/* Short gold rule between the greeting and the promise — the Tamil
            hero's own visual signature, standing in for the Latin script
            face the English hero uses to separate its two tiers. */}
        <span
          aria-hidden="true"
          className="mt-3 block h-[3px] w-14 rounded-full"
          style={{ background: "var(--palmyra-gold)" }}
        />

        {promise && (
          <h1
            className="mt-3 max-w-[16ch] text-[25px] font-semibold leading-[1.38] text-white sm:max-w-[22ch] sm:text-[31px] lg:text-[37px]"
            style={{
              textShadow:
                "0 1px 3px rgba(10, 44, 30, 0.55), 0 1px 14px rgba(10, 44, 30, 0.3)",
            }}
          >
            {promise}
          </h1>
        )}

        {subtitle && (
          <p className="mt-4 max-w-[52ch] text-[15px] leading-[1.75] text-white/85 md:text-[17px]">
            {subtitle}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`${lobsterTwo.variable} ${comfortaa.variable}`}>
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

      <h1
        className="mt-1 text-[38px] leading-[1.15] text-white sm:text-[50px] lg:text-[64px]"
        style={{ fontFamily: "var(--font-lobster-two), var(--font-serif)" }}
      >
        {/* Per-word reveal: each word is masked in its own overflow-hidden
            box and the inner span slides up from below on load — pure CSS
            (kani-word-reveal, globals.css), so this stays a Server Component
            with no client JS or animation library. */}
        {title.split(" ").map((word, i, words) => {
          const bare = word.replace(/[^a-z]/gi, "").toLowerCase();
          const isAccent = ["trust", "north", "east"].includes(bare);
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
          style={{ fontFamily: "var(--font-comfortaa), var(--font-sans)" }}
        >
          {subtitle}
        </ScrollReveal>
      )}
    </div>
  );
}
