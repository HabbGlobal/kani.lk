import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default OG card for the homepage and any page without its own listing photo. */
export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #12452F 0%, #0A2C1E 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", marginBottom: 28 }}>
          <span style={{ fontSize: 84, fontWeight: 600, color: "#ffffff" }}>kani</span>
          <span style={{ fontSize: 84, fontWeight: 600, color: "#BE9B4E" }}>.lk</span>
        </div>
        <div
          style={{
            fontSize: 15,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.65)",
            marginBottom: 44,
          }}
        >
          Find. Invest. Own.
        </div>
        <div style={{ fontSize: 40, color: "#ffffff", maxWidth: 900, lineHeight: 1.3 }}>
          Land for sale and rent across the Northern &amp; Eastern provinces
        </div>
      </div>
    ),
    { ...size }
  );
}
