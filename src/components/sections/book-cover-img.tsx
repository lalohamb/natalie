import Image from "next/image";
import type { AdminBook } from "@/content/types";

/** Covers served by this site (uploads under /media-files/, files in /public) can go through the image optimizer. */
const isLocal = (url: string) => url.startsWith("/") && !url.startsWith("//");

export function BookCoverImg({
  book,
  sizes,
  className,
}: {
  book: AdminBook;
  sizes: string;
  className?: string;
}) {
  if (!book.coverUrl) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-linen border border-sand px-4 text-center">
        <span aria-hidden className="block h-px w-8 bg-gold/60" />
        <p className="font-display text-base italic text-stone leading-snug text-balance">{book.title}</p>
        <p className="font-sans text-[0.65rem] font-semibold text-stone uppercase tracking-[0.18em]">Cover coming soon</p>
        <span aria-hidden className="block h-px w-8 bg-gold/60" />
      </div>
    );
  }

  const alt = book.coverAlt ?? book.title;

  // Resized and re-encoded (AVIF/WebP) per viewport. Every caller wraps the
  // cover in a `relative` box with a fixed aspect ratio, which `fill` needs.
  if (isLocal(book.coverUrl)) {
    return <Image src={book.coverUrl} alt={alt} fill sizes={sizes} className={`object-cover ${className ?? ""}`} />;
  }

  // A cover pasted as an external URL: its host isn't in `images.remotePatterns`, so it is shown as-is.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={book.coverUrl}
      alt={alt}
      sizes={sizes}
      className={`h-full w-full object-cover ${className ?? ""}`}
      loading="lazy"
    />
  );
}
