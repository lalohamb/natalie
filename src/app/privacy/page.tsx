import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { getSite } from "@/lib/content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Natalie Flemons Ministries.",
  alternates: { canonical: "/privacy" },
  openGraph: { url: "/privacy" },
};

export default function PrivacyPage() {
  const site = getSite();

  return (
    <section aria-labelledby="privacy-heading" className="py-section">
      <Container className="max-w-prose">
        <h1
          id="privacy-heading"
          className="font-display text-display-lg font-medium motion-safe:animate-rise"
        >
          Privacy Policy
        </h1>

        {/* ⚠️ Placeholder — ministry must supply approved policy text before launch.
            Do not publish fabricated legal text. */}
        <div className="mt-10 flex flex-col gap-6 text-pretty text-stone motion-safe:animate-rise [animation-delay:80ms]">
          <p className="rounded-sm border border-sand bg-linen px-6 py-4 text-sm">
            Our Privacy Policy is being finalised. Please check back soon, or contact us at{" "}
            <a
              href={`mailto:${site.email}`}
              className="text-espresso underline decoration-gold underline-offset-4 hover:text-ember"
            >
              {site.email}
            </a>{" "}
            with any privacy-related questions.
          </p>

          <p>
            <strong className="font-semibold text-espresso">{site.legalName}</strong> is committed
            to protecting your privacy. This page will contain our full Privacy Policy once it has
            been reviewed and approved.
          </p>

          <p>
            In the meantime, please know that any information you provide through our newsletter
            sign-up or contact form is used solely to respond to your inquiry or send you ministry
            updates you have requested. We do not sell or share your personal information with
            third parties.
          </p>

          <p className="text-sm text-stone">
            Last updated: pending final review.
          </p>
        </div>
      </Container>
    </section>
  );
}
