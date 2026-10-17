"use client";

import { useState } from "react";
import { Reveal } from "@/components/motion/reveal";
import { BookCard } from "@/components/sections/book-card";
import type { Book } from "@/content/types";
import { cn } from "@/lib/cn";

type Tab = { id: string; label: string };

const TABS: Tab[] = [
  { id: "all", label: "All" },
  { id: "prophetic", label: "Prophetic" },
  { id: "destiny", label: "Destiny" },
  { id: "warfare", label: "Warfare" },
];

export function BooksPageClient({ books }: { books: Book[] }) {
  const [active, setActive] = useState("all");

  const visible = books.filter(
    (b) => !b.companionOf && (active === "all" || b.category === active),
  );

  return (
    <>
      {/* ── Filter tabs ── */}
      <div className="border-b border-sand bg-linen">
        <div className="mx-auto max-w-[var(--container-site)] px-[var(--spacing-gutter)]">
          <div
            role="tablist"
            aria-label="Filter books by category"
            className="flex justify-center gap-1 overflow-x-auto"
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={active === tab.id}
                onClick={() => setActive(tab.id)}
                className={cn(
                  "shrink-0 border-b-2 px-5 py-4 font-sans text-sm font-semibold uppercase tracking-[0.1em] transition-colors duration-200",
                  active === tab.id
                    ? "border-espresso text-espresso"
                    : "border-transparent text-stone hover:text-espresso",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Books grid ── */}
      <section aria-label="Publications" className="py-section">
        <div className="mx-auto max-w-[var(--container-site)] px-[var(--spacing-gutter)]">
          {visible.length > 0 ? (
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {visible.map((book, i) => (
                <Reveal key={book.slug} delay={i * 0.07}>
                  <BookCard book={book} layout="vertical" />
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="py-16 text-center text-stone">
              No books in this category yet.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
