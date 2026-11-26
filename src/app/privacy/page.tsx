import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { getSite } from "@/lib/content";
import { readLegal } from "@/lib/legal-store";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Natalie Flemons Ministries.",
  alternates: { canonical: "/privacy" },
  openGraph: { url: "/privacy" },
};

export default async function PrivacyPage() {
  const site = getSite();
  const { privacy } = await readLegal();

  return (
    <>
      <section className="border-b border-sand bg-linen py-16">
        <Container>
          <h1
            id="privacy-heading"
            className="font-display text-display-lg font-medium motion-safe:animate-rise"
          >
            Privacy Policy
          </h1>
          <p className="mt-4 text-stone motion-safe:animate-rise [animation-delay:80ms]">
            {site.legalName} &mdash; Effective {privacy.effectiveDate}
          </p>
        </Container>
      </section>

      <section aria-labelledby="privacy-heading" className="py-section">
        <Container className="max-w-prose">
          <div className="flex flex-col gap-10 text-pretty text-stone motion-safe:animate-rise">
            {privacy.sections.map((section, i) => (
              <div key={i} className="flex flex-col gap-3">
                <h2 className="font-display text-xl font-medium text-espresso">{section.heading}</h2>
                {section.paragraphs.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </div>
            ))}

            <p className="text-sm text-stone border-t border-sand pt-6">
              Last updated: {privacy.effectiveDate}
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
