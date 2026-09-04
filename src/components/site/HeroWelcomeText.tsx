import { Lobster_Two, Comfortaa } from "next/font/google";
import { ScrollReveal } from "./ScrollReveal";

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
 * The hero's welcome line. A short Comfortaa eyebrow ("Welcome to kani.lk")
 * sits above the admin-editable headline, set in Lobster Two — one pairing,
 * two roles: geometric sans for the greeting, script serif for the promise.
 */
export function HeroWelcomeText({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className={`${lobsterTwo.variable} ${comfortaa.variable}`}>
      <p
        className="text-[15px] font-bold uppercase tracking-[0.16em] text-white sm:text-[16px]"
        style={{
          fontFamily: "var(--font-comfortaa), var(--font-sans)",
          textShadow: "0 1px 3px rgba(10, 44, 30, 0.65), 0 1px 12px rgba(10, 44, 30, 0.35)",
        }}
      >
        Welcome to kani.lk
      </p>

      <h1
        className="mt-1 text-[38px] leading-[1.15] text-white sm:text-[50px] lg:text-[64px]"
        style={{ fontFamily: "var(--font-lobster-two), var(--font-serif)" }}
      >
        {title}
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
