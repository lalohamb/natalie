import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/motion/reveal";
import { BookCard } from "@/components/sections/book-card";
import { BookCoverImg } from "@/components/sections/book-cover-img";
import { CheckoutButton } from "@/components/sections/checkout-button";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { JsonLd } from "@/components/seo/json-ld";
import { getBook, getBooks } from "@/lib/book-content";
import { formatPrice } from "@/lib/format";
import { checkoutFulfilment } from "@/lib/stripe";
import { bookStructuredData } from "@/lib/structured-data";

export const instant = false;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBook(slug);
  if (!book) return {};
  return {
    title: book.title,
    description: book.summary,
    alternates: { canonical: `/books/${slug}` },
    openGraph: { url: `/books/${slug}` },
  };
}

/** "the United States and Canada" — from the countries checkout accepts. */
function shippingDestinations() {
  const names = new Intl.DisplayNames(["en"], { type: "region" });
  const countries = checkoutFulfilment().shippingCountries.map((code) => {
    const name = names.of(code) ?? code;
    return code === "US" ? "the United States" : name;
  });
  return new Intl.ListFormat("en", { style: "long", type: "conjunction" }).format(countries);
}

export default async function BookDetailPage({ params }: Props) {
  const { slug } = await params;
  const book = await getBook(slug);
  if (!book) notFound();

  const allBooks = await getBooks();
  const companion = book.companionOf
    ? allBooks.find((b) => b.slug === book.companionOf)
    : allBooks.find((b) => b.companionOf === book.slug);

  const related = allBooks
    .filter((b) => b.slug !== book.slug && b.slug !== companion?.slug && b.featured)
    .slice(0, 2);

  const purchaseHref = book.purchase.kind === "external" ? book.purchase.url : null;
  const checkout = book.purchase.kind === "stripe-checkout" && !!book.purchase.priceId;

  return (
    <>
      <JsonLd data={bookStructuredData(book)} />
      <article aria-labelledby="book-title">
        <section className="py-section">
          <Container className="grid items-start gap-14 lg:grid-cols-12 lg:gap-8">
            {/* Cover */}
            <div className="mx-auto w-4/5 max-w-xs lg:sticky lg:top-28 lg:col-span-4 lg:w-full lg:max-w-none motion-safe:animate-fade">
              <div className="relative overflow-hidden shadow-cover aspect-[2/3]">
                <BookCoverImg
                  book={book}
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
              {book.subtitle && <p className="mt-3 font-display text-2xl text-stone italic">{book.subtitle}</p>}
              {book.forewordBy && <p className="mt-4 text-sm text-stone">Foreword by {book.forewordBy}</p>}

              <div className="mt-8 border-t border-sand pt-6">
                {book.priceCents !== undefined && (
                  <p className="font-display text-2xl text-espresso">
                    <span className="sr-only">Price: </span>
                    {formatPrice(book.priceCents)}
                  </p>
                )}
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                {book.status === "published" && checkout && book.purchase.kind === "stripe-checkout" && (
                  <CheckoutButton slug={book.slug}>{book.purchase.label}</CheckoutButton>
                )}
                {book.status === "published" && purchaseHref && (
                  <ButtonLink href={purchaseHref}>
                    {book.purchase.kind !== "none" ? book.purchase.label : "Purchase"}
                  </ButtonLink>
                )}
                {book.status === "forthcoming" && (
                  <p className="self-center font-sans text-sm text-stone">Coming soon</p>
                )}
              </div>
              {book.status === "published" && checkout && (
                <p className="mt-4 font-sans text-sm text-stone">Ships to {shippingDestinations()}. $5.00 shipping · allow 7–10 business days.</p>
              )}

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
