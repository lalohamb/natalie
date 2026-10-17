import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { getSite } from "@/lib/content";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of Use for Natalie Flemons Ministries.",
  alternates: { canonical: "/terms" },
  openGraph: { url: "/terms" },
};

export default function TermsPage() {
  const site = getSite();

  return (
    <>
      <section className="border-b border-sand bg-linen py-16">
        <Container>
          <h1
            id="terms-heading"
            className="font-display text-display-lg font-medium motion-safe:animate-rise"
          >
            Terms of Use
          </h1>
          <p className="mt-4 text-stone motion-safe:animate-rise [animation-delay:80ms]">
            {site.legalName}
          </p>
        </Container>
      </section>

      <section aria-labelledby="terms-heading" className="py-section">
        <Container className="max-w-prose">
          <div className="flex flex-col gap-6 text-pretty text-stone motion-safe:animate-rise">
            <p className="rounded-sm border border-sand bg-linen px-6 py-4 text-sm">
              Our Terms of Use are being finalised. Please check back soon, or contact us at{" "}
              <a
                href={`mailto:${site.email}`}
                className="text-espresso underline decoration-gold underline-offset-4 hover:text-ember"
              >
                {site.email}
              </a>{" "}
              with any questions.
            </p>

            <p>
              By accessing and using this website, you agree to be bound by the Terms of Use of{" "}
              <strong className="font-semibold text-espresso">{site.legalName}</strong>. Our full
              Terms of Use will be published here once they have been reviewed and approved.
            </p>

            <p>
              All content on this website — including text, images, book descriptions, and ministry
              materials — is the property of {site.legalName} and may not be reproduced without
              written permission.
            </p>

            <p className="text-sm text-stone">
              Last updated: pending final review.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
