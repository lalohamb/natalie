import { NewsletterForm } from "@/components/forms/newsletter-form";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { getHomeContent } from "@/lib/content";

export function NewsletterSection() {
  const { newsletter } = getHomeContent();

  return (
    <section
      id="newsletter"
      aria-labelledby="newsletter-heading"
      className="scroll-mt-24 border-b border-ivory/10 bg-espresso py-10 text-ivory"
    >
      <Container>
        <Reveal className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-8">
          <div className="lg:col-span-5">
            <Eyebrow tone="dark">{newsletter.eyebrow}</Eyebrow>
            <h2 id="newsletter-heading" className="mt-6 font-display text-display-md font-medium text-balance">
              {newsletter.heading}
            </h2>
            <p className="mt-5 text-pretty text-mist">{newsletter.body}</p>
          </div>
          <NewsletterForm className="relative lg:col-span-6 lg:col-start-7" />
        </Reveal>
      </Container>
    </section>
  );
}
