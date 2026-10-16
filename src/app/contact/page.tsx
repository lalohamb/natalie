import type { Metadata } from "next";
import { ContactForm } from "@/components/forms/contact-form";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getSite } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Natalie Flemons Ministries — general inquiries and booking requests.",
  alternates: { canonical: "/contact" },
  openGraph: { url: "/contact" },
};

export default function ContactPage() {
  const site = getSite();

  return (
    <section aria-labelledby="contact-heading" className="py-section">
      <Container className="grid gap-16 lg:grid-cols-12 lg:gap-8">
        {/* Left — heading + direct contact */}
        <div className="lg:col-span-4 motion-safe:animate-rise">
          <SectionHeading
            as="h1"
            id="contact-heading"
            eyebrow="Contact"
            title="Get in touch"
            lede="For general questions, booking inquiries, and ministry partnerships."
          />

          <div className="mt-12 flex flex-col gap-6 border-t border-sand pt-10">
            <div>
              <p className="font-sans text-eyebrow font-semibold text-gold-ink uppercase tracking-[0.22em]">
                Email
              </p>
              <a
                href={`mailto:${site.email}`}
                className="mt-2 block text-espresso underline decoration-gold underline-offset-4 hover:text-ember"
              >
                {site.email}
              </a>
            </div>

            <div>
              <p className="font-sans text-eyebrow font-semibold text-gold-ink uppercase tracking-[0.22em]">
                Booking inquiries
              </p>
              <p className="mt-2 text-sm text-pretty text-stone">
                Churches, ministries, organizations and event coordinators — use the form and
                select &ldquo;Booking inquiry&rdquo; as the subject.
              </p>
            </div>

            <div>
              <p className="font-sans text-eyebrow font-semibold text-gold-ink uppercase tracking-[0.22em]">
                Response time
              </p>
              <p className="mt-2 text-sm text-stone">
                We aim to respond within 3–5 business days.
              </p>
            </div>
          </div>
        </div>

        {/* Right — form */}
        <div className="lg:col-span-7 lg:col-start-6 motion-safe:animate-rise [animation-delay:80ms]">
          <ContactForm />
        </div>
      </Container>
    </section>
  );
}
