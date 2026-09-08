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

    // The promise types in line by line. Splitting on spaces would break the
    // sweep across arbitrary points, so it is chunked into roughly equal
    // phrases and each chunk animates as one line.
    const promiseWords = promise ? promise.split(" ") : [];
    const perLine = Math.ceil(promiseWords.length / 3) || 1;
    const promiseLines: string[] = [];
    for (let k = 0; k < promiseWords.length; k += perLine) {
      promiseLines.push(promiseWords.slice(k, k + perLine).join(" "));
    }

    const LINE_MS = 780;
    const GREETING_MS = 620;

    return (
      <div style={{ fontFamily: "var(--font-tamil)" }}>
        <p
          className="kani-type-line text-[22px] font-semibold leading-[1.3] sm:text-[27px] lg:text-[31px]"
          style={{
            color: "var(--palmyra-gold-soft)",
            ["--kani-type-dur" as string]: `${GREETING_MS}ms`,
            textShadow:
              "0 1px 3px rgba(10, 44, 30, 0.65), 0 1px 12px rgba(10, 44, 30, 0.35)",
          }}
        >
          {/* "KANI" stays gold with the rest of the greeting; ".LK" picks up
              the paddy green, mirroring the English hero's "kani.lk" split. */}
          {greeting.split(/(\.LK)/i).map((part, k) =>
            /^\.LK$/i.test(part) ? (
              <span key={k} style={{ color: "var(--paddy)" }}>
                {part}
              </span>
            ) : (
              part
            )
          )}
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
            {promiseLines.map((line, k) => {
              const delay = GREETING_MS + 140 + k * LINE_MS;
              const isLast = k === promiseLines.length - 1;
              return (
                <span
                  key={k}
                  className={`kani-type-line ${isLast ? "kani-type-caret" : ""}`}
                  style={{
                    ["--kani-type-dur" as string]: `${LINE_MS}ms`,
                    ["--kani-type-delay" as string]: `${delay}ms`,
                    ["--kani-caret-end" as string]: `${delay + LINE_MS + 1900}ms`,
                  }}
                >
                  {/* "நம்பக்கூடிய" ("trustworthy") is the promise's key word —
                      gold, the same accent role "trust" plays in English. */}
                  {line.split(/(நம்பக்கூடிய)/).map((part, m) =>
                    part === "நம்பக்கூடிய" ? (
                      <span key={m} style={{ color: "var(--palmyra-gold-soft)" }}>
                        {part}
                      </span>
                    ) : (
                      part
                    )
                  )}
                </span>
              );
            })}
          </h1>
        )}

        {subtitle && (
          <p
            className="kani-hero-sub-ta mt-4 max-w-[52ch] text-[15px] font-medium leading-[1.75] text-white md:text-[17px]"
            style={{
              // Brighter than the English subtitle's white/85 and lifted off a
              // busy photograph by a deep scrim shadow plus a faint warm glow.
              textShadow:
                "0 1px 2px rgba(4, 12, 9, 0.9), 0 2px 10px rgba(4, 12, 9, 0.65), 0 0 22px rgba(216, 189, 130, 0.28)",
            }}
          >
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
