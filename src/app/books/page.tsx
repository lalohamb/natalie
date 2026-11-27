import type { Metadata } from "next";
import Image from "next/image";
import { BooksPageClient } from "./books-page-client";
import { getPublishedBooks } from "@/lib/book-content";

export const metadata: Metadata = {
  title: "Books",
  description:
    "Published works by Natalie C. Flemons — manuals and guides written to equip believers for purity, perseverance and purpose.",
  alternates: { canonical: "/books" },
  openGraph: { url: "/books" },
};

export default async function BooksPage() {
  const books = await getPublishedBooks();

  return (
    <>
      {/* ── Page header with old-books background ── */}
      <section className="relative border-b border-sand">
        {/* Full-width image at its natural ratio */}
        <div className="relative w-full aspect-[2172/724]">
          <Image
            src="/Antique Books in Warm Olive Light.png"
            alt=""
            aria-hidden
            fill
            className="object-cover object-center"
            priority
          />
          {/* Left gradient for text readability */}
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-espresso/80 via-espresso/40 to-transparent" />
          {/* Text — vertically centered, aligned to content width */}
          <div className="absolute inset-0 flex items-center">
            <div className="w-full px-[var(--spacing-gutter)]">
              <div className="max-w-xl">
                <p className="flex items-center gap-4 font-sans text-eyebrow font-semibold uppercase text-gold-light">
                  <span aria-hidden className="rule-gold" />
                  Publications
                </p>
                <h1 className="mt-4 font-display text-display-md font-medium text-ivory motion-safe:animate-rise">
                  Books by Natalie C. Flemons
                </h1>
                <p className="mt-4 max-w-prose text-lede text-mist">
                  Manuals and guides written to equip believers for purity, perseverance and purpose.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tabs + grid (client component) ── */}
      <BooksPageClient books={books} />
    </>
  );
}
