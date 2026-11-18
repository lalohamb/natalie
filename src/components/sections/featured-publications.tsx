import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getHomeContent } from "@/lib/content";
import { getPublishedBooks } from "@/lib/book-content";
import type { AdminBook } from "@/content/types";
import { BookCoverImg } from "@/components/sections/book-cover-img";

function FeaturedBookCard({ book, index }: { book: AdminBook; index: number }) {
  return (
    <Reveal delay={index * 0.07}>
      <article aria-labelledby={`feat-book-${book.slug}`}>
        <Link href={`/books/${book.slug}`} tabIndex={-1} aria-hidden className="group/cover block">
          <div className="relative aspect-[2/3] overflow-hidden shadow-cover transition-transform duration-500 ease-editorial group-hover/cover:-translate-y-1">
            <BookCoverImg
              book={book}
              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
            />
          </div>
        </Link>
        <div className="mt-4">
          <h3 id={`feat-book-${book.slug}`} className="font-display text-display-sm font-medium text-balance">
            <Link href={`/books/${book.slug}`} className="hover:text-ember">
              {book.title}
            </Link>
          </h3>
          {book.subtitle && <p className="mt-1 font-display text-sm italic text-stone">{book.subtitle}</p>}
          <p className="mt-2 text-sm text-pretty text-stone line-clamp-2">{book.summary}</p>
          <ButtonLink href={`/books/${book.slug}`} variant="text" arrow className="mt-3" aria-label={`Learn more about ${book.title}`}>
            Learn More
          </ButtonLink>
        </div>
      </article>
    </Reveal>
  );
}

export async function FeaturedPublications() {
  const { publications } = getHomeContent();
  const featured = (await getPublishedBooks()).filter((b) => !b.companionOf).slice(0, 3);

  if (!featured.length) return null;

  return (
    <section aria-labelledby="publications-heading" className="bg-linen py-12 lg:py-14">
      <Container>
        <Reveal className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            id="publications-heading"
            eyebrow={publications.eyebrow}
            title={publications.heading}
            lede={publications.lede}
          />
          <ButtonLink href={publications.cta.href} variant="text" arrow className="shrink-0 self-start md:self-auto">
            {publications.cta.label}
          </ButtonLink>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-8">
          {featured.map((book, i) => (
            <FeaturedBookCard key={book.slug} book={book} index={i} />
          ))}
        </div>
      </Container>
    </section>
  );
}
