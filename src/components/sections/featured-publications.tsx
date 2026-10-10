import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getFeaturedBooks, getHomeContent } from "@/lib/content";
import { BookCard } from "./book-card";

export function FeaturedPublications() {
  const { publications } = getHomeContent();
  const featured = getFeaturedBooks();
  const [lead, ...rest] = featured.filter((book) => !book.companionOf);
  const companion = lead && featured.find((book) => book.companionOf === lead.slug);

  if (!lead) return null;

  return (
    <section aria-labelledby="publications-heading" className="bg-linen py-section">
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

        <Reveal className="mt-20">
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

        {rest.length > 0 && (
          <div className="mt-20 grid gap-16 border-t border-sand pt-16 lg:grid-cols-2 lg:gap-12">
            {rest.map((book, index) => (
              <Reveal key={book.slug} delay={index * 0.08}>
                <BookCard book={book} />
              </Reveal>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
