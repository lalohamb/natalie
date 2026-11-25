import { ImageResponse } from "next/og";
import { getSite } from "@/lib/content";


export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  const site = getSite();

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #2c1a0e 0%, #4a2c14 60%, #7a4a1e 100%)",
          padding: "64px",
          fontFamily: "serif",
        }}
      >
        {/* Gold rule */}
        <div style={{ display: "flex", width: 48, height: 2, background: "#c9a84c", marginBottom: 32 }} />

        <div
          style={{
            fontSize: 56,
            fontWeight: 600,
            color: "#faf6ef",
            lineHeight: 1,
            letterSpacing: "-0.015em",
            textTransform: "uppercase",
            marginBottom: 20,
          }}
        >
          {site.name}
        </div>

        <div
          style={{
            fontSize: 24,
            color: "#c9a84c",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontFamily: "sans-serif",
            fontWeight: 600,
          }}
        >
          {site.tagline}
        </div>
      </div>
    ),
    size,
  );
}
