import { ImageResponse } from "next/og";
import { getEvent } from "@/lib/content";
import { getSite } from "@/lib/content";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ slug: string }> };

const CATEGORY_LABELS: Record<string, string> = {
  conference: "Conference",
  workshop: "Workshop",
  service: "Service",
  appearance: "Appearance",
  other: "Event",
};

function formatEventDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export default async function EventOgImage({ params }: Props) {
  const { slug } = await params;
  const event = getEvent(slug);
  const site = getSite();

  const location = [event?.city, event?.state].filter(Boolean).join(", ");
  const categoryLabel = event ? CATEGORY_LABELS[event.category] ?? "Event" : "Event";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          background: "linear-gradient(160deg, #1a2e1a 0%, #2a4a2a 50%, #1e3a1e 100%)",
          padding: "64px",
        }}
      >
        {/* Top — category badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              padding: "6px 16px",
              background: "rgba(201,168,76,0.15)",
              border: "1px solid rgba(201,168,76,0.4)",
              borderRadius: 2,
              fontSize: 13,
              fontFamily: "sans-serif",
              fontWeight: 700,
              color: "#c9a84c",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            {categoryLabel}
          </div>
          {event?.status === "cancelled" && (
            <div
              style={{
                display: "flex",
                padding: "6px 16px",
                background: "rgba(180,60,40,0.2)",
                border: "1px solid rgba(180,60,40,0.4)",
                borderRadius: 2,
                fontSize: 13,
                fontFamily: "sans-serif",
                fontWeight: 700,
                color: "#e07060",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
              }}
            >
              Cancelled
            </div>
          )}
        </div>

        {/* Middle — title */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <div
            style={{
              fontSize: event?.title && event.title.length > 40 ? 48 : 60,
              fontWeight: 600,
              color: "#faf6ef",
              lineHeight: 1.05,
              fontFamily: "serif",
              letterSpacing: "-0.01em",
            }}
          >
            {event?.title ?? "Event"}
          </div>
        </div>

        {/* Bottom — date, location, site name */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Gold rule */}
          <div style={{ display: "flex", width: 40, height: 2, background: "#c9a84c", marginBottom: 4 }} />

          <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
            {event && (
              <div
                style={{
                  fontSize: 20,
                  color: "#d4c5a9",
                  fontFamily: "sans-serif",
                  fontWeight: 500,
                }}
              >
                {formatEventDate(event.startDate)}
              </div>
            )}
            {location && (
              <div
                style={{
                  fontSize: 20,
                  color: "#8a9a8a",
                  fontFamily: "sans-serif",
                }}
              >
                {location}
              </div>
            )}
          </div>

          <div
            style={{
              fontSize: 14,
              color: "#5a7a5a",
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
