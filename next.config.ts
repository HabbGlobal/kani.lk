import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root: this project sits under a OneDrive path with a
  // package-lock.json higher up, which Turbopack would otherwise try to adopt.
  turbopack: { root: import.meta.dirname },
  serverExternalPackages: ["mongoose", "sharp", "bcryptjs", "nodemailer"],
  images: {
    // Photos are served from our own /api/images/[id]; no remote hosts needed.
    formats: ["image/webp"],
    // 1920/2560 matter for the hero specifically: it renders at `sizes="100vw"`,
    // so a wide monitor — or any 2x display, where the effective request is
    // double the CSS width — asks for more than 1600px. Without these the
    // browser gets a 1600px image and upscales it, which is what made the
    // banner look soft even though the sources are 2400px wide.
    deviceSizes: [360, 420, 640, 768, 1024, 1280, 1600, 1920, 2560],
    imageSizes: [64, 96, 128, 200, 256, 384],
    // Next only honours quality values listed here; anything else is rejected.
    qualities: [75, 82, 90],
    minimumCacheTTL: 31536000,
  },
  async headers() {
    return [
      {
        source: "/api/images/:id",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
