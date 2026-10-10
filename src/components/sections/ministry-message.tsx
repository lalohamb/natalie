import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { getHomeContent } from "@/lib/content";

export function MinistryMessage() {
  const { message } = getHomeContent();

  return (
    <section aria-labelledby="message-heading" className="bg-espresso py-section text-ivory">
      <Container>
        <Reveal className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <Eyebrow tone="dark">{message.eyebrow}</Eyebrow>
            <h2 id="message-heading" className="mt-6 font-display text-display-lg font-medium text-balance">
              {message.heading}
            </h2>
          </div>
          <p className="self-end text-lede text-pretty text-mist lg:col-span-6 lg:col-start-7">{message.lede}</p>
        </Reveal>

        <ol className="mt-20 grid border-t border-ivory/15 md:grid-cols-3">
          {message.pillars.map((pillar, index) => (
            <li
              key={pillar.title}
              className="border-b border-ivory/15 py-10 md:border-b-0 md:px-8 md:py-12 md:not-first:border-l md:first:pl-0 md:last:pr-0"
            >
              <Reveal delay={index * 0.08}>
                <p aria-hidden className="font-sans text-eyebrow font-semibold text-gold-light">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-4 font-display text-display-sm font-medium italic">{pillar.title}</h3>
                <p className="mt-5 text-pretty text-mist">{pillar.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
