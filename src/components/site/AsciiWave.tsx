"use client";

import { useEffect, useRef } from "react";

const CHARS = " .:-=+*#%@";

/**
 * A slow ASCII sine-wave field, drawn on canvas as a decorative backdrop.
 * Kept deliberately faint (see `opacity`) so footer text stays the subject,
 * and frozen entirely for visitors who ask for reduced motion.
 */
export function AsciiWave({
  color = "#4e9a51",
  speed = 1,
  opacity = 0.14,
}: {
  color?: string;
  speed?: number;
  opacity?: number;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cell = 12;
    let raf = 0;
    let t = 0;
    let cols = 0;
    let rows = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(width / cell);
      rows = Math.ceil(height / cell);
      ctx.font = `${cell}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.textBaseline = "top";
    };

    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = color;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          // Two interfering sine trains give the field its drifting bands.
          const v =
            Math.sin(x * 0.22 + t) * 0.5 +
            Math.sin(y * 0.34 - t * 0.7) * 0.35 +
            Math.sin((x + y) * 0.12 + t * 0.4) * 0.25;
          const i = Math.floor(((v + 1) / 2) * (CHARS.length - 1));
          const ch = CHARS[Math.max(0, Math.min(CHARS.length - 1, i))];
          if (ch !== " ") ctx.fillText(ch, x * cell, y * cell);
        }
      }
    };

    const frame = () => {
      t += 0.02 * speed;
      draw();
      raf = requestAnimationFrame(frame);
    };

    resize();
    if (reduced) {
      draw();
    } else {
      raf = requestAnimationFrame(frame);
    }

    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [color, speed]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ opacity }}
    />
  );
}
