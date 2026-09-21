import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";

/**
 * The hero's welcome line — one shared treatment for both locales, the one
 * originally built for Tamil: a gold greeting line, a short gold rule, and a
 * smaller supporting headline that types in line by line.
 *
 * (English used to render its own design — a Comfortaa eyebrow over a large
 * Lobster Two headline with a per-word reveal — but both locales now share the
 * Tamil layout so the two landing pages read as one site. The per-word reveal
 * is gone for English too: it split on spaces, which fragments Tamil words
 * mid-phrase and reads differently from the line reveal.)
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

  // The Tamil headline is written as two sentences — a greeting
    // ("KANI.LK-க்கு வரவேற்கிறோம்.") and the promise that follows. Splitting
    // on that first full stop lets each play its own role instead of running
    // together into one oversized five-line block. English has no such split,
    // so its greeting is the fixed "Welcome to kani.lk" eyebrow and the whole
    // headline plays the promise role. If the Tamil headline is a single
    // sentence, `promise` is empty and the greeting carries the hero alone.
    let greeting: string;
    let promise: string;
    if (isTamil) {
      const [first, ...rest] = title.split(/(?<=\.)\s+/);
      greeting = first;
      promise = rest.join(" ").trim();
    } else {
      greeting = "Welcome to kani.lk";
      promise = title.trim();
    }

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
                  {/* The promise's key word is gold: "நம்பக்கூடிய"
                      ("trustworthy") in Tamil; "trust" / "north" / "east" in
                      English — the same accent role in each locale. */}
                  {line.split(
                    isTamil ? /(நம்பக்கூடிய)/ : /(\btrust\b|\bnorth\b|\beast\b)/i
                  ).map((part, m) =>
                    (isTamil
                      ? part === "நம்பக்கூடிய"
                      : /^(trust|north|east)$/i.test(part)) ? (
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
