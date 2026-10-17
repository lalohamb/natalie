import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import type { Book } from "@/content/types";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";

type BookCardProps = {
  book: Book;
  layout?: "feature" | "standard" | "companion";
  headingLevel?: "h3" | "h4";
  className?: string;
  /** Feature layout only: extra content (e.g. a companion title) under the actions. */
  children?: React.ReactNode;
};

function BookCover({ book, sizes, className }: { book: Book; sizes: string; className?: string }) {
  return (
    <Link
      href={`/books/${book.slug}`}
      tabIndex={-1}
      aria-hidden
      className={cn("group/cover block", className)}
    >
      <div
        className={cn(
          "relative overflow-hidden shadow-cover transition-transform duration-500 ease-editorial group-hover/cover:-translate-y-1.5",
          book.coverIsMockup ? "aspect-[2/3]" : "aspect-[2/3]",
        )}
      >
        {book.coverIsMockup ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-linen border border-sand px-4 text-center">
            <span aria-hidden className="block h-px w-8 bg-gold/60" />
            <p className="font-display text-base italic text-stone leading-snug text-balance">
              {book.title}
            </p>
            <p className="font-sans text-[0.65rem] font-semibold text-stone uppercase tracking-[0.18em]">
              Cover coming soon
            </p>
            <span aria-hidden className="block h-px w-8 bg-gold/60" />
          </div>
        ) : (
          <Image
            src={book.cover.src}
            alt={book.cover.alt}
            placeholder="blur"
            sizes={sizes}
            className="h-full w-full object-cover"
          />
        )}
      </div>
    </Link>
  );
}

function BookActions({ book, compact = false }: { book: Book; compact?: boolean }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-6 gap-y-3", compact ? "mt-5" : "mt-8")}>
      <ButtonLink
        href={`/books/${book.slug}`}
        variant={compact ? "text" : "secondary"}
        arrow={compact}
        aria-label={`Learn more about ${book.title}`}
      >
        Learn More
      </ButtonLink>
      {book.purchase.kind === "external" && (
        <ButtonLink
          href={book.purchase.url}
          variant={compact ? "text" : "primary"}
          aria-label={`${book.purchase.label} ${book.title}`}
        >
          {book.purchase.label}
        </ButtonLink>
      )}
    </div>
  );
}

function Price({ cents }: { cents?: number }) {
  if (cents === undefined) return null;
  return (
    <p className="font-display text-2xl text-espresso">
      <span className="sr-only">Price: </span>
      {formatPrice(cents)}
    </p>
  );
}

export function BookCard({ book, layout = "standard", headingLevel = "h3", className, children }: BookCardProps) {
  const Heading = headingLevel;

  if (layout === "feature") {
    return (
      <article className={cn("grid items-start gap-10 md:grid-cols-12 md:gap-8", className)}>
        <BookCover
          book={book}
          sizes="(min-width: 1024px) 380px, (min-width: 768px) 40vw, 80vw"
          className="mx-auto w-4/5 max-w-sm md:sticky md:top-28 md:col-span-5 md:w-full lg:col-span-4"
        />
        <div className="md:col-span-7 lg:col-span-7 lg:col-start-6">
          <p className="font-sans text-eyebrow font-semibold text-gold-ink uppercase md:mt-6">Featured title</p>
          <Heading className="mt-4 font-display text-display-md font-medium text-balance">
            <Link href={`/books/${book.slug}`} className="hover:text-ember">
              {book.title}
            </Link>
          </Heading>
          {book.subtitle && <p className="mt-2 font-display text-2xl text-stone italic">{book.subtitle}</p>}
          {book.forewordBy && (
            <p className="mt-4 text-sm text-stone">Foreword by {book.forewordBy}</p>
          )}
          <p className="mt-6 max-w-prose text-lede text-pretty text-stone">{book.summary}</p>
          <div className="mt-8 border-t border-sand pt-6">
            <Price cents={book.priceCents} />
          </div>
          <BookActions book={book} />
          {children}
        </div>
      </article>
    );
  }

  if (layout === "companion") {
    return (
      <article className={cn("grid items-center gap-6 sm:grid-cols-[minmax(0,13rem)_1fr] sm:gap-8", className)}>
        <BookCover book={book} sizes="(min-width: 640px) 208px, 90vw" />
        <div>
          <p className="font-sans text-eyebrow font-semibold text-gold-ink uppercase">Companion workbook</p>
          <Heading className="mt-3 font-display text-display-sm font-medium">
            <Link href={`/books/${book.slug}`} className="hover:text-ember">
              {book.title}
            </Link>
          </Heading>
          <p className="mt-3 text-pretty text-stone">{book.summary}</p>
          <div className="mt-4">
            <Price cents={book.priceCents} />
          </div>
          <BookActions book={book} compact />
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "grid grid-cols-[minmax(0,9rem)_1fr] items-start gap-x-6 gap-y-6 sm:grid-cols-[minmax(0,13rem)_1fr] sm:gap-x-10",
        className,
      )}
    >
      <BookCover book={book} sizes="(min-width: 640px) 208px, 144px" className="sm:row-span-2" />
      <div>
        <Heading className="font-display text-display-sm font-medium text-balance">
          <Link href={`/books/${book.slug}`} className="hover:text-ember">
            {book.title}
          </Link>
        </Heading>
        {book.subtitle && <p className="mt-1 font-display text-lg text-stone italic">{book.subtitle}</p>}
        <div className="mt-4">
          <Price cents={book.priceCents} />
        </div>
      </div>
      <div className="col-span-2 sm:col-span-1 sm:col-start-2">
        <p className="text-pretty text-stone">{book.summary}</p>
        <BookActions book={book} compact />
      </div>
    </article>
  );
}
