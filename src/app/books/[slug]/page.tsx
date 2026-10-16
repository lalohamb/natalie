import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/motion/reveal";
import { BookCard } from "@/components/sections/book-card";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { getBook, getBooks } from "@/lib/content";
import { formatPrice } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getBooks().map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const book = getBook(slug);
  if (!book) return {};
  return {
    title: book.title,
    description: book.summary,
    alternates: { canonical: `/books/${slug}` },
    openGraph: { url: `/books/${slug}` },
  };
}

export default async function BookDetailPage({ params }: Props) {
  const { slug } = await params;
  const book = getBook(slug);
  if (!book) notFound();

  const allBooks = getBooks();
  const companion = book.companionOf
    ? allBooks.find((b) => b.slug === book.companionOf)
    : allBooks.find((b) => b.companionOf === book.slug);

  const related = allBooks.filter(
    (b) => b.slug !== book.slug && b.slug !== companion?.slug && b.featured,
  ).slice(0, 2);

  const canPurchase = book.status === "published" && book.purchase.kind === "external";

  return (
    <>
      {/* ── Book detail ── */}
      <article aria-labelledby="book-title">
        <section className="py-section">
          <Container className="grid items-start gap-14 lg:grid-cols-12 lg:gap-8">
            {/* Cover */}
            <div className="mx-auto w-4/5 max-w-xs lg:sticky lg:top-28 lg:col-span-4 lg:w-full lg:max-w-none motion-safe:animate-fade">
              <div
                className={`relative overflow-hidden shadow-cover ${
                  book.coverIsMockup ? "aspect-[4/3]" : "aspect-[2/3]"
                }`}
              >
                <Image
                  src={book.cover.src}
                  alt={book.cover.alt}
                  placeholder="blur"
                  fetchPriority="high"
                  loading="eager"
                  quality={85}
                  sizes="(min-width: 1280px) 380px, (min-width: 1024px) 32vw, 80vw"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-7 lg:col-start-6 motion-safe:animate-rise [animation-delay:80ms]">
              <Eyebrow>
                {book.status === "forthcoming" ? "Forthcoming" : book.status === "unavailable" ? "Out of print" : "Published"}
              </Eyebrow>

              <h1 id="book-title" className="mt-6 font-display text-display-lg font-medium text-balance">
                {book.title}
              </h1>
              {book.subtitle && (
                <p className="mt-3 font-display text-2xl text-stone italic">{book.subtitle}</p>
              )}
              {book.forewordBy && (
                <p className="mt-4 text-sm text-stone">Foreword by {book.forewordBy}</p>
              )}

              <div className="mt-8 border-t border-sand pt-6">
                {book.priceCents !== undefined && (
                  <p className="font-display text-2xl text-espresso">
                    <span className="sr-only">Price: </span>
                    {formatPrice(book.priceCents)}
                  </p>
                )}
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                {canPurchase && (
                  <ButtonLink href={(book.purchase as { kind: "external"; url: string; label: string }).url}>
                    {(book.purchase as { kind: "external"; url: string; label: string }).label}
                  </ButtonLink>
                )}
                {book.status === "forthcoming" && (
                  <p className="self-center font-sans text-sm text-stone">Coming soon</p>
                )}
              </div>

              <div className="mt-12 flex flex-col gap-5 text-pretty text-stone">
                {book.description.map((para, i) => (
                  <p key={i} className={i === 0 ? "text-lede" : undefined}>{para}</p>
                ))}
              </div>

              {book.note && (
                <p className="mt-8 border-l-2 border-gold pl-5 text-sm text-stone italic">{book.note}</p>
              )}
            </div>
          </Container>
        </section>

        {/* ── Companion ── */}
        {companion && (
          <section aria-labelledby="companion-heading" className="bg-linen py-section">
            <Container>
              <Reveal>
                <h2 id="companion-heading" className="mb-10 font-sans text-eyebrow font-semibold text-gold-ink uppercase tracking-[0.22em]">
                  {book.companionOf ? "Part of a series" : "Companion workbook"}
                </h2>
                <BookCard book={companion} />
              </Reveal>
            </Container>
          </section>
        )}

        {/* ── Related titles ── */}
        {related.length > 0 && (
          <section aria-labelledby="related-heading" className="py-section">
            <Container>
              <h2 id="related-heading" className="mb-10 font-sans text-eyebrow font-semibold text-gold-ink uppercase tracking-[0.22em]">
                More by Natalie C. Flemons
              </h2>
              <div className="grid gap-12 lg:grid-cols-2">
                {related.map((b, i) => (
                  <Reveal key={b.slug} delay={i * 0.08}>
                    <BookCard book={b} />
                  </Reveal>
                ))}
              </div>
            </Container>
          </section>
        )}
      </article>
    </>
  );
}
