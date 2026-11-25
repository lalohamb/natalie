import { ImageResponse } from "next/og";
import { getBio, getSite } from "@/lib/content";
import { assetImageDataUrl } from "@/lib/og-assets";


export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function AboutOgImage() {
  const bio = getBio();
  const site = getSite();
  const portrait = await assetImageDataUrl("natalie-portrait-main.jpg");

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #2c1a0e 0%, #4a2c14 60%, #7a4a1e 100%)",
        }}
      >
        {/* Portrait placeholder — warm texture panel */}
        <div
          style={{
            display: "flex",
            width: 420,
            height: "100%",
            flexShrink: 0,
            background: "linear-gradient(180deg, #5a3a1a 0%, #3a2010 100%)",
            position: "relative",
          }}
        >
          {portrait && (
            <img
              src={portrait}
              alt=""
              width={420}
              height={630}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 18%" }}
            />
          )}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to right, transparent 55%, #2c1a0e 100%)",
            }}
          />
        </div>

        {/* Text panel */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            flex: 1,
            padding: "64px 64px 64px 48px",
          }}
        >
          {/* Eyebrow */}
          <div
            style={{
              fontSize: 13,
              fontFamily: "sans-serif",
              fontWeight: 700,
              color: "#c9a84c",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: 20,
            }}
          >
            About
          </div>

          {/* Name */}
          <div
            style={{
              fontSize: 58,
              fontWeight: 600,
              color: "#faf6ef",
              lineHeight: 1,
              fontFamily: "serif",
              letterSpacing: "-0.01em",
              marginBottom: 20,
            }}
          >
            {bio.name}
          </div>

          {/* Gold rule */}
          <div style={{ display: "flex", width: 40, height: 2, background: "#c9a84c", marginBottom: 20 }} />

          {/* Identity line — truncated */}
          <div
            style={{
              fontSize: 18,
              color: "#d4c5a9",
              fontFamily: "serif",
              fontStyle: "italic",
              lineHeight: 1.4,
              marginBottom: 36,
            }}
          >
            {bio.identityLine}
          </div>

          {/* Site name */}
          <div
            style={{
              fontSize: 14,
              color: "#8a7a6a",
              fontFamily: "sans-serif",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {site.name}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
