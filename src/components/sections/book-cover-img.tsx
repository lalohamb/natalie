import type { AdminBook } from "@/content/types";

export function BookCoverImg({
  book,
  sizes,
  className,
}: {
  book: AdminBook;
  sizes: string;
  className?: string;
}) {
  if (!book.coverUrl || book.coverIsMockup) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-linen border border-sand px-4 text-center">
        <span aria-hidden className="block h-px w-8 bg-gold/60" />
        <p className="font-display text-base italic text-stone leading-snug text-balance">{book.title}</p>
        <p className="font-sans text-[0.65rem] font-semibold text-stone uppercase tracking-[0.18em]">Cover coming soon</p>
        <span aria-hidden className="block h-px w-8 bg-gold/60" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={book.coverUrl}
      alt={book.coverAlt ?? book.title}
      sizes={sizes}
      className={`h-full w-full object-cover ${className ?? ""}`}
      loading="lazy"
    />
  );
}
