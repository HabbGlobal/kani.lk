import sharp from "sharp";

/**
 * Sample photography for the seed. These are generated SVG landscapes rather
 * than stock photos — they carry the right palette, they are legally clean, and
 * they run through the exact same sharp pipeline the admin upload uses, so the
 * seeded site exercises the real code path.
 *
 * Replace with the client's real photographs before launch.
 */
export type Scene = "paddy" | "bare" | "coconut" | "house" | "town" | "coastal";

function palm(x: number, y: number, scale: number, tint: string): string {
  const f = (dx: number, dy: number, cx: number, cy: number) =>
    `<path d="M${x} ${y} Q${x + cx * scale} ${y + cy * scale} ${x + dx * scale} ${y + dy * scale}"
       stroke="${tint}" stroke-width="${2.6 * scale}" fill="none" stroke-linecap="round"/>`;
  return `<g>
    <rect x="${x - 1.6 * scale}" y="${y}" width="${3.2 * scale}" height="${46 * scale}"
          fill="#6b5a3e" rx="${1.5 * scale}"/>
    ${f(-22, -6, -14, -20)}${f(22, -6, 14, -20)}
    ${f(-16, 10, -16, -8)}${f(16, 10, 16, -8)}
    ${f(-3, -20, -8, -16)}${f(4, -19, 9, -15)}
  </g>`;
}

function scenery(scene: Scene, seed: number): string {
  const sky = `
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8fb8d8"/>
        <stop offset="55%" stop-color="#cfe0e8"/>
        <stop offset="100%" stop-color="#f2e6cf"/>
      </linearGradient>
      <linearGradient id="far" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#7d9a86"/>
        <stop offset="100%" stop-color="#5d7f6a"/>
      </linearGradient>
    </defs>
    <rect width="1600" height="1200" fill="url(#sky)"/>
    <circle cx="${240 + seed * 90}" cy="210" r="58" fill="#fff3d6" opacity="0.85"/>
    <path d="M0 560 C260 500 520 520 820 505 C1120 490 1380 512 1600 496 L1600 620 L0 620 Z"
          fill="url(#far)" opacity="0.75"/>`;

  const trees = (n: number, y: number, s: number) =>
    Array.from({ length: n }, (_, i) =>
      palm(120 + i * (1400 / n) + ((seed * 37 + i * 53) % 60), y, s, "#2f6b45")
    ).join("");

  switch (scene) {
    case "paddy":
      return `${sky}
        <rect y="600" width="1600" height="600" fill="#7bb56a"/>
        <path d="M0 600 L1600 600 L1600 760 L0 800 Z" fill="#96c97e"/>
        <path d="M0 800 L1600 760 L1600 940 L0 960 Z" fill="#7ab463"/>
        <path d="M0 960 L1600 940 L1600 1200 L0 1200 Z" fill="#649c53"/>
        ${Array.from({ length: 26 }, (_, i) =>
          `<path d="M${i * 62} 1200 L${i * 62 + 34} 800" stroke="#5b9049"
                 stroke-width="2" opacity="0.5"/>`).join("")}
        <path d="M0 780 Q800 760 1600 776" stroke="#c9b98d" stroke-width="9" fill="none"/>
        ${trees(6, 596, 1.5)}`;

    case "bare":
      return `${sky}
        <rect y="600" width="1600" height="600" fill="#c2a878"/>
        <path d="M0 600 L1600 600 L1600 720 L0 745 Z" fill="#9db482"/>
        <path d="M0 745 L1600 720 L1600 1200 L0 1200 Z" fill="#c6ac7d"/>
        <path d="M0 1010 C420 960 900 950 1600 930 L1600 1200 L0 1200 Z" fill="#b1682f" opacity="0.55"/>
        ${Array.from({ length: 9 }, (_, i) =>
          `<rect x="${90 + i * 170}" y="${800 - (i % 2) * 8}" width="9" height="120"
                 fill="#e6e1d4" rx="4"/>`).join("")}
        <path d="M92 830 L1600 800" stroke="#e6e1d4" stroke-width="4" opacity="0.9"/>
        ${trees(5, 596, 1.6)}`;

    case "coconut":
      return `${sky}
        <rect y="600" width="1600" height="600" fill="#8fb46f"/>
        <path d="M0 660 L1600 640 L1600 1200 L0 1200 Z" fill="#7ea765"/>
        ${Array.from({ length: 9 }, (_, i) =>
          palm(110 + i * 175, 700 + ((i * 41) % 70), 2.1 + ((i * 13) % 5) / 10, "#2c6540")
        ).join("")}
        <path d="M0 1120 Q800 1080 1600 1110" stroke="#c4ab7d" stroke-width="26" fill="none" opacity="0.8"/>`;

    case "house":
      return `${sky}
        <rect y="620" width="1600" height="580" fill="#8fb46f"/>
        <path d="M0 700 L1600 680 L1600 1200 L0 1200 Z" fill="#7fa763"/>
        <g>
          <rect x="470" y="700" width="660" height="300" fill="#f3efe3"/>
          <path d="M430 706 L800 546 L1170 706 Z" fill="#a44a2a"/>
          <rect x="740" y="840" width="120" height="160" fill="#12452f"/>
          <rect x="560" y="800" width="110" height="96" fill="#cfe0e8" stroke="#e6e1d4" stroke-width="7"/>
          <rect x="940" y="800" width="110" height="96" fill="#cfe0e8" stroke="#e6e1d4" stroke-width="7"/>
          <rect x="440" y="992" width="720" height="16" fill="#d8d2c2"/>
        </g>
        <path d="M800 1010 L800 1200" stroke="#c4ab7d" stroke-width="70" opacity="0.75"/>
        ${trees(4, 640, 1.5)}`;

    case "town":
      return `${sky}
        <rect y="640" width="1600" height="560" fill="#b9b4a6"/>
        ${Array.from({ length: 7 }, (_, i) => {
          const h = 200 + ((i * 67 + seed * 31) % 190);
          return `<rect x="${60 + i * 220}" y="${900 - h}" width="185" height="${h}"
                   fill="${i % 2 ? "#e8e3d6" : "#f1ede1"}" stroke="#d5cfbe" stroke-width="3"/>
                  ${Array.from({ length: 3 }, (_, k) =>
                    `<rect x="${86 + i * 220 + k * 52}" y="${940 - h}" width="34" height="44"
                       fill="#12452f" opacity="0.5"/>`).join("")}
                  <rect x="${60 + i * 220}" y="860" width="185" height="44" fill="#12452f" opacity="0.85"/>`;
        }).join("")}
        <rect y="900" width="1600" height="300" fill="#8d887c"/>
        <path d="M0 1050 L1600 1050" stroke="#f3efe3" stroke-width="8" stroke-dasharray="60 44"/>`;

    case "coastal":
      return `${sky}
        <rect y="600" width="1600" height="240" fill="#4a90a4"/>
        <path d="M0 700 Q400 680 800 700 T1600 700 L1600 840 L0 840 Z" fill="#3f8397"/>
        ${Array.from({ length: 5 }, (_, i) =>
          `<path d="M${i * 340} ${730 + i * 14} q80 -12 160 0" stroke="#e8f1f2"
                 stroke-width="5" fill="none" opacity="0.75"/>`).join("")}
        <path d="M0 840 Q800 812 1600 840 L1600 1200 L0 1200 Z" fill="#e6d7b0"/>
        <path d="M0 990 Q800 962 1600 990 L1600 1200 L0 1200 Z" fill="#dccba1"/>
        ${trees(5, 860, 1.9)}`;
  }
}

/** Render a scene to a JPEG buffer, ready for the real processing pipeline. */
export async function renderScene(scene: Scene, seed = 0): Promise<Buffer> {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1200"
                    viewBox="0 0 1600 1200">${scenery(scene, seed)}</svg>`;
  return sharp(Buffer.from(svg)).jpeg({ quality: 88 }).toBuffer();
}
