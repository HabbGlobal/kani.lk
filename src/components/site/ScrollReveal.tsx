"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Word-by-word scroll reveal: each word blurs, tilts and rises into place as
 * it's staggered in, once the block enters the viewport. Built directly with
 * an IntersectionObserver and CSS transitions rather than the `lightswind`
 * package (not installed in this repo) or framer-motion (not a dependency
 * here either) — same visual result, no new dependency.
 *
 * Fires once, stays visible after, and skips straight to the resting state
 * for `prefers-reduced-motion`.
 */
export function ScrollReveal({
  children,
  className,
  style,
  staggerMs = 28,
  baseRotation = 4,
  /** When false, skip the scroll trigger and reveal as soon as this flips
   * true — for a block that's already above the fold on load (like a hero),
   * where "on scroll into view" would never fire naturally. Omit for the
   * normal scroll-triggered behaviour. */
  startWhen,
}: {
  children: string;
  className?: string;
  style?: React.CSSProperties;
  /** Delay between each word's animation start, in ms. */
  staggerMs?: number;
  /** Starting tilt in degrees; settles to 0. */
  baseRotation?: number;
  startWhen?: boolean;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [reduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [visible, setVisible] = useState(reduced);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || startWhen !== undefined) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -60px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [startWhen, reduced]);

  // `startWhen` controls visibility directly for blocks already above the
  // fold on load, where "on scroll into view" would never fire naturally.
  const isVisible = startWhen !== undefined ? Boolean(startWhen) : visible;

  const words = children.split(" ");

  return (
    <p ref={ref} className={cn(className)} style={style}>
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block will-change-[transform,filter,opacity]"
          style={
            reduced
              ? undefined
              : {
                  opacity: isVisible ? 1 : 0.08,
                  filter: isVisible ? "blur(0px)" : "blur(6px)",
                  transform: isVisible
                    ? "translate3d(0,0,0) rotate(0deg)"
                    : `translate3d(0,10px,0) rotate(${baseRotation}deg)`,
                  transition:
                    "opacity 480ms var(--ease-out), filter 480ms var(--ease-out), transform 480ms var(--ease-out)",
                  transitionDelay: `${i * staggerMs}ms`,
                }
          }
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}
