import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root: this project sits under a OneDrive path with a
  // package-lock.json higher up, which Turbopack would otherwise try to adopt.
  turbopack: { root: import.meta.dirname },
  serverExternalPackages: ["mongoose", "sharp", "bcryptjs", "nodemailer"],
  images: {
    // Photos are served from our own /api/images/[id]; no remote hosts needed.
    formats: ["image/webp"],
    deviceSizes: [360, 420, 640, 768, 1024, 1280, 1600],
    imageSizes: [64, 96, 128, 200, 256, 384],
    qualities: [75, 90],
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
