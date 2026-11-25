import { ImageResponse } from "next/og";
import { getBook } from "@/lib/book-content";
import { getSite } from "@/lib/content";
import { uploadedImageDataUrl } from "@/lib/og-assets";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ slug: string }> };

export default async function BookOgImage({ params }: Props) {
  const { slug } = await params;
  const book = await getBook(slug);
  const site = getSite();

  // Uploaded covers are read from disk; a cover pasted as an external https URL is fetched as-is.
  const coverUrl =
    (await uploadedImageDataUrl(book?.coverUrl)) ??
    (book?.coverUrl && /^https:\/\//.test(book.coverUrl) ? book.coverUrl : null);

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
        {/* Cover image — left panel */}
        {coverUrl && (
          <div
            style={{
              display: "flex",
              width: 340,
              height: "100%",
              flexShrink: 0,
              position: "relative",
            }}
          >
            <img
              src={coverUrl}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            {/* fade to dark on the right edge */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to right, transparent 60%, #2c1a0e 100%)",
              }}
            />
          </div>
        )}

        {/* Text — right panel */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            flex: 1,
            padding: "64px 64px 64px 48px",
          }}
        >
          {/* Gold rule */}
          <div style={{ display: "flex", width: 40, height: 2, background: "#c9a84c", marginBottom: 28 }} />

          {/* Title */}
          <div
            style={{
              fontSize: book?.title && book.title.length > 30 ? 44 : 52,
              fontWeight: 600,
              color: "#faf6ef",
              lineHeight: 1.05,
              letterSpacing: "-0.01em",
              fontFamily: "serif",
              marginBottom: 16,
            }}
          >
            {book?.title ?? "Book"}
          </div>

          {/* Subtitle */}
          {book?.subtitle && (
            <div
              style={{
                fontSize: 22,
                color: "#c9a84c",
                fontFamily: "serif",
                fontStyle: "italic",
                marginBottom: 28,
                lineHeight: 1.3,
              }}
            >
              {book.subtitle}
            </div>
          )}

          {/* Author byline */}
          <div
            style={{
              fontSize: 18,
              color: "#d4c5a9",
              fontFamily: "sans-serif",
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Natalie C. Flemons
          </div>

          {/* Site name footer */}
          <div
            style={{
              marginTop: 40,
              paddingTop: 20,
              borderTop: "1px solid rgba(201,168,76,0.3)",
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
