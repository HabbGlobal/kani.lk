/**
 * Placeholder hero banner, generated at the real 1920x820 aspect so the layout
 * is correct before the client's photograph arrives. Overwrite public/banner.jpg
 * with the real image and nothing else needs to change.
 */
import sharp from "sharp";

const W = 1920;
const H = 820;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#8ab5d6"/>
      <stop offset="45%" stop-color="#cfe2ea"/>
      <stop offset="100%" stop-color="#f6e9cf"/>
    </linearGradient>
    <linearGradient id="hill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#6f9483"/>
      <stop offset="100%" stop-color="#4e7160"/>
    </linearGradient>
    <linearGradient id="paddy" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#8fc678"/>
      <stop offset="100%" stop-color="#5c9a4c"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <circle cx="330" cy="200" r="86" fill="#fff6dd" opacity="0.85"/>

  <path d="M0 372 C220 320 380 344 560 330 C760 314 900 350 1080 336
           C1300 320 1560 348 1920 330 L1920 470 L0 470 Z"
        fill="url(#hill)" opacity="0.66"/>
  <path d="M980 356 C1080 300 1180 296 1290 344 C1400 300 1520 312 1620 356
           L1620 430 L980 430 Z" fill="#5a7f6b" opacity="0.72"/>

  <rect y="430" width="${W}" height="390" fill="url(#paddy)"/>
  <path d="M0 430 L1920 424 L1920 520 L0 540 Z" fill="#7fb96a"/>
  <path d="M0 540 L1920 520 L1920 640 L0 664 Z" fill="#6ba957"/>
  <path d="M0 664 L1920 640 L1920 820 L0 820 Z" fill="#5c9a4c"/>

  ${Array.from({ length: 30 }, (_, i) =>
    `<path d="M${i * 66 - 40} 820 L${i * 66 + 120} 545" stroke="#4f8b43" stroke-width="3" opacity="0.45"/>`
  ).join("")}

  <path d="M0 600 C420 566 900 560 1920 548" stroke="#c8b78c" stroke-width="14"
        fill="none" opacity="0.85"/>
  <path d="M1180 820 C1330 700 1500 620 1920 576 L1920 660 C1520 700 1380 760 1300 820 Z"
        fill="#cbb591" opacity="0.95"/>

  ${[
    [1490, 470, 2.5], [1600, 452, 2.2], [1720, 480, 2.7],
    [1350, 462, 1.9], [1840, 458, 2.3], [240, 470, 1.7], [120, 484, 2.0],
  ].map(([x, y, s]) => `
    <g>
      <rect x="${x - 4 * s}" y="${y}" width="${8 * s}" height="${118 * s / 2}" fill="#6a5a3f" rx="3"/>
      ${[[-1, -0.3], [1, -0.3], [-0.8, 0.35], [0.8, 0.35], [-0.15, -1], [0.25, -0.95]]
        .map(([dx, dy]) =>
          `<path d="M${x} ${y} q${dx * 34 * s} ${-26 * s} ${dx * 56 * s} ${dy * 40 * s}"
                 stroke="#2f6b45" stroke-width="${5 * s / 2}" fill="none" stroke-linecap="round"/>`
        ).join("")}
    </g>`).join("")}

  <g opacity="0.94">
    <rect x="640" y="392" width="150" height="72" fill="#efe8da"/>
    <path d="M622 394 L715 340 L808 394 Z" fill="#a4512c"/>
    <rect x="700" y="424" width="28" height="40" fill="#3c4a3f"/>
  </g>

  <rect width="${W}" height="${H}" fill="#0a2c1e" opacity="0.06"/>
</svg>`;

async function main() {
  await sharp(Buffer.from(svg))
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile("public/banner.jpg");

  const { promises: fs } = await import("node:fs");
  const { size } = await fs.stat("public/banner.jpg");
  console.log(
    `✓ public/banner.jpg written (${Math.round(size / 1024)}KB, ${W}x${H})`
  );
}

main();
