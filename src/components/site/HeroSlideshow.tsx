"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const SLIDES = [
  { src: "/hero-1.webp", alt: "Coconut palms in rows across a Vanni estate at golden hour" },
  { src: "/hero-2.webp", alt: "Paddy fields stretching to the hills near a village at sunset" },
  { src: "/hero-3.webp", alt: "Terraced vegetable plots below the central hills at sunrise" },
  { src: "/hero-4.webp", alt: "Mist rising over paddy fields and forest as the sun breaks over the hills" },
  { src: "/hero-5.webp", alt: "A palm-lined dirt track beside a stream through green paddy land" },
];

const HOLD_MS = 6000;

/**
 * Books `fn` for when the browser is idle, falling back to a timeout on
 * Safari, which still ships no requestIdleCallback. Returns its own canceller
 * so the caller doesn't have to remember which scheduler was used.
 */
function whenIdle(fn: () => void): () => void {
  const ric = window.requestIdleCallback as typeof window.requestIdleCallback | undefined;
  if (ric) {
    const handle = ric(fn, { timeout: 2500 });
    return () => window.cancelIdleCallback(handle);
  }
  const handle = window.setTimeout(fn, 1200);
  return () => window.clearTimeout(handle);
}

/**
 * Crossfading hero background. Every slide is mounted throughout — only
 * opacity moves — so there's no decode pop when a slide becomes active, and
 * the very first slide is already the priority-loaded one from initial paint.
 * Rotation stops (parked on slide 1) for `prefers-reduced-motion`.
 *
 * Slides 2-5 stay lazy until first paint is done. Loading them eagerly costs
 * ~1.5MB of off-screen imagery competing with the one slide the visitor is
 * actually looking at; `warm` flips them to eager once the page is idle, which
 * is still many seconds before the first crossfade at HOLD_MS.
 */
export function HeroSlideshow() {
  const [active, setActive] = useState(0);
  const [warm, setWarm] = useState(false);

  useEffect(() => {
    const cancelWarm = whenIdle(() => setWarm(true));

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return cancelWarm;

    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % SLIDES.length);
    }, HOLD_MS);
    return () => {
      window.clearInterval(id);
      cancelWarm();
    };
  }, []);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-[var(--kani-green-deep)]">
      {SLIDES.map((slide, i) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={i === 0 ? slide.alt : ""}
          fill
          priority={i === 0}
          fetchPriority={i === 0 ? "high" : undefined}
          loading={i === 0 ? undefined : warm ? "eager" : "lazy"}
          sizes="100vw"
          quality={82}
          className={cn(
            "object-cover object-center transition-opacity duration-[1600ms] ease-in-out",
            i === active ? "opacity-100" : "opacity-0"
          )}
        />
      ))}
    </div>
  );
}
