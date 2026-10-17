import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getFeaturedBooks, getHomeContent } from "@/lib/content";
import type { Book } from "@/content/types";

function FeaturedBookCard({ book, index }: { book: Book; index: number }) {
  return (
    <Reveal delay={index * 0.07}>
      <article aria-labelledby={`feat-book-${book.slug}`}>
        {/* Cover */}
        <Link href={`/books/${book.slug}`} tabIndex={-1} aria-hidden className="group/cover block">
          <div className="relative aspect-[2/3] overflow-hidden shadow-cover transition-transform duration-500 ease-editorial group-hover/cover:-translate-y-1">
            {book.coverIsMockup ? (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-linen border border-sand px-3 text-center">
                <span aria-hidden className="block h-px w-6 bg-gold/60" />
                <p className="font-display text-sm italic text-stone leading-snug text-balance">{book.title}</p>
                <p className="font-sans text-[0.6rem] font-semibold text-stone uppercase tracking-[0.15em]">Cover coming soon</p>
                <span aria-hidden className="block h-px w-6 bg-gold/60" />
              </div>
            ) : (
              <Image
                src={book.cover.src}
                alt={book.cover.alt}
                placeholder="blur"
                sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                className="h-full w-full object-cover"
              />
            )}
          </div>
        </Link>

        {/* Text */}
        <div className="mt-4">
          <h3 id={`feat-book-${book.slug}`} className="font-display text-display-sm font-medium text-balance">
            <Link href={`/books/${book.slug}`} className="hover:text-ember">
              {book.title}
            </Link>
          </h3>
          {book.subtitle && (
            <p className="mt-1 font-display text-sm italic text-stone">{book.subtitle}</p>
          )}
          <p className="mt-2 text-sm text-pretty text-stone line-clamp-2">{book.summary}</p>
          <ButtonLink
            href={`/books/${book.slug}`}
            variant="text"
            arrow
            className="mt-3"
            aria-label={`Learn more about ${book.title}`}
          >
            Learn More
          </ButtonLink>
        </div>
      </article>
    </Reveal>
  );
}

export function FeaturedPublications() {
  const { publications } = getHomeContent();
  // Show first 3 featured non-companion books on the homepage
  const featured = getFeaturedBooks().filter((b) => !b.companionOf).slice(0, 3);

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
