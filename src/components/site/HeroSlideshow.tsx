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
 * Crossfading hero background. Every slide is mounted throughout — only
 * opacity moves — so there's no decode pop when a slide becomes active, and
 * the very first slide is already the priority-loaded one from initial paint.
 * Rotation stops (parked on slide 1) for `prefers-reduced-motion`.
 */
export function HeroSlideshow() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % SLIDES.length);
    }, HOLD_MS);
    return () => window.clearInterval(id);
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
          loading={i === 0 ? undefined : "eager"}
          sizes="100vw"
          quality={80}
          className={cn(
            "object-cover object-center transition-opacity duration-[1600ms] ease-in-out",
            i === active ? "opacity-100" : "opacity-0"
          )}
        />
      ))}
    </div>
  );
}
