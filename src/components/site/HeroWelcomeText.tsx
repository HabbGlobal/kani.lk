"use client";

import { useEffect, useRef, useState } from "react";
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
 * The hero's welcome line, typed on. A short Comfortaa eyebrow ("Welcome to
 * kani.lk") types first, then the admin-editable headline types in Lobster
 * Two underneath — one pairing, two roles: geometric sans for the greeting,
 * script serif for the promise.
 *
 * Typing is done by hand with a timer rather than a library, since nothing
 * in this repo pulls in the `lightswind` package. Respects reduced motion
 * by skipping straight to the full text.
 */
export function HeroWelcomeText({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const eyebrow = "Welcome to kani.lk";
  const [eyebrowText, setEyebrowText] = useState("");
  const [titleText, setTitleText] = useState("");
  const [eyebrowDone, setEyebrowDone] = useState(false);
  const [titleDone, setTitleDone] = useState(false);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced.current) {
      setEyebrowText(eyebrow);
      setTitleText(title);
      setEyebrowDone(true);
      setTitleDone(true);
      return;
    }

    let i = 0;
    const eyebrowTimer = window.setInterval(() => {
      i += 1;
      setEyebrowText(eyebrow.slice(0, i));
      if (i >= eyebrow.length) {
        window.clearInterval(eyebrowTimer);
        setEyebrowDone(true);
      }
    }, 55);

    return () => window.clearInterval(eyebrowTimer);
    // Eyebrow text is fixed; only run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!eyebrowDone || reduced.current) return;
    let i = 0;
    const titleTimer = window.setInterval(() => {
      i += 1;
      setTitleText(title.slice(0, i));
      if (i >= title.length) {
        window.clearInterval(titleTimer);
        setTitleDone(true);
      }
    }, 40);
    return () => window.clearInterval(titleTimer);
  }, [eyebrowDone, title]);

  return (
    <div className={`${lobsterTwo.variable} ${comfortaa.variable}`}>
      <p
        className="text-[15px] font-bold uppercase tracking-[0.16em] text-white sm:text-[16px]"
        style={{
          fontFamily: "var(--font-comfortaa), var(--font-sans)",
          textShadow: "0 1px 3px rgba(10, 44, 30, 0.65), 0 1px 12px rgba(10, 44, 30, 0.35)",
        }}
      >
        {eyebrowText}
        {!eyebrowDone && <span className="animate-pulse">|</span>}
      </p>

      <h1
        className="mt-1 text-[38px] leading-[1.15] text-white sm:text-[50px] lg:text-[64px]"
        style={{ fontFamily: "var(--font-lobster-two), var(--font-serif)" }}
      >
        {titleText}
        {eyebrowDone && titleText.length < title.length && (
          <span className="animate-pulse">|</span>
        )}
      </h1>

      {subtitle && (
        <ScrollReveal
          startWhen={titleDone}
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
