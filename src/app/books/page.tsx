import type { Metadata } from "next";
import { Reveal } from "@/components/motion/reveal";
import { BookCard } from "@/components/sections/book-card";
import { NewsletterSection } from "@/components/sections/newsletter-section";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
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
  // Lead title: Repairing the Breach (first non-companion featured book)
  const [lead, ...rest] = books.filter((b) => !b.companionOf);
  const companion = lead && books.find((b) => b.companionOf === lead.slug);

  return (
    <>
      {/* ── Header ── */}
      <section className="border-b border-sand bg-linen py-16">
        <Container>
          <SectionHeading
            as="h1"
            eyebrow="Publications"
            title="Books by Natalie C. Flemons"
            lede="Manuals and guides written to equip believers for purity, perseverance and purpose."
            className="motion-safe:animate-rise"
          />
        </Container>
      </section>

      {/* ── Lead title + companion ── */}
      <section aria-label="Featured publication" className="py-section">
        <Container>
          <Reveal>
            <BookCard book={lead} layout="feature">
              {companion && (
                <BookCard
                  book={companion}
                  layout="companion"
                  headingLevel="h4"
                  className="mt-14 border-t border-sand pt-10"
                />
              )}
            </BookCard>
          </Reveal>
        </Container>
      </section>

      {/* ── Remaining titles ── */}
      {rest.length > 0 && (
        <section aria-label="All publications" className="bg-linen py-section">
          <Container>
            <div className="grid gap-16 lg:grid-cols-2 lg:gap-12">
              {rest.map((book, i) => (
                <Reveal key={book.slug} delay={i * 0.08}>
                  <BookCard book={book} />
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      <NewsletterSection />
    </>
  );
}
