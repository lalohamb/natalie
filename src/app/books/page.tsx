import type { Metadata } from "next";
import { BooksPageClient } from "./books-page-client";
import { getBooks } from "@/lib/content";

export const metadata: Metadata = {
  title: "Books",
  description:
    "Published works by Natalie C. Flemons — manuals and guides written to equip believers for purity, perseverance and purpose.",
  alternates: { canonical: "/books" },
  openGraph: { url: "/books" },
};

export default function BooksPage() {
  const books = getBooks();

  return (
    <>
      {/* ── Page header with old-books background ── */}
      <section className="relative overflow-hidden border-b border-sand bg-linen">
        {/* Background: antique books photo fading in from the right */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `url("/Antique Books in Warm Olive Light.png")`,
            backgroundSize: "contain",
            backgroundPosition: "right center",
            maskImage: "linear-gradient(to right, transparent 45%, black 70%)",
            WebkitMaskImage: "linear-gradient(to right, transparent 25%, black 70%)",
            opacity: 0.45,
          }}
        />
        <div className="relative mx-auto max-w-[var(--container-site)] px-[var(--spacing-gutter)] py-14 lg:py-16">
          <div className="max-w-xl">
            <p className="flex items-center gap-4 font-sans text-eyebrow font-semibold uppercase text-gold-ink">
              <span aria-hidden className="rule-gold" />
              Publications
            </p>
            <h1 className="mt-4 font-display text-display-md font-medium text-espresso motion-safe:animate-rise">
              Books by Natalie C. Flemons
            </h1>
            <p className="mt-4 max-w-prose text-lede text-stone">
              Manuals and guides written to equip believers for purity, perseverance and purpose.
            </p>
          </div>
        </div>
      </section>

      {/* ── Tabs + grid (client component) ── */}
      <BooksPageClient books={books} />
    </>
  );
}
