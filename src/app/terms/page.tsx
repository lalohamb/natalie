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
            {site.legalName} &mdash; Effective January 1, 2025
          </p>
        </Container>
      </section>

      <section aria-labelledby="terms-heading" className="py-section">
        <Container className="max-w-prose">
          <div className="flex flex-col gap-10 text-pretty text-stone motion-safe:animate-rise">

            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-medium text-espresso">1. Acceptance of Terms</h2>
              <p>
                By accessing or using{" "}
                <a href={site.url} className="text-espresso underline decoration-gold underline-offset-4 hover:text-ember">{site.url}</a>{" "}
                (the &ldquo;Site&rdquo;), you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using the Site. These Terms of Use apply to all visitors, users, and others who access the Site.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-medium text-espresso">2. About {site.name}</h2>
              <p>
                {site.legalName} is a Christian ministry organization dedicated to equipping, restoring, and activating believers. The Site provides information about ministry activities, events, publications, and resources, and facilitates donations and book purchases.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-medium text-espresso">3. Intellectual Property</h2>
              <p>
                All content on the Site — including but not limited to text, graphics, logos, images, audio clips, book descriptions, sermon content, and ministry materials — is the property of {site.legalName} or its content suppliers and is protected by applicable copyright and intellectual property laws.
              </p>
              <p>
                You may view, download, and print content from the Site for your personal, non-commercial use only, provided you do not modify the content and you retain all copyright and proprietary notices. Any other use — including reproduction, distribution, public display, or creation of derivative works — requires prior written permission from {site.legalName}.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-medium text-espresso">4. Purchases and Donations</h2>
              <p>
                The Site facilitates the purchase of ministry publications and the making of financial donations. By completing a purchase or donation, you agree to the following:
              </p>
              <ul className="flex flex-col gap-2 pl-5 list-disc marker:text-gold">
                <li>All transactions are processed securely through Stripe. By submitting payment information, you also agree to Stripe&rsquo;s terms of service.</li>
                <li>Prices are listed in US dollars and are subject to change without notice.</li>
                <li>Donations to {site.legalName} are made voluntarily and are non-refundable unless required by applicable law.</li>
                <li>For physical book purchases, please contact us at{" "}
                  <a href={`mailto:${site.email}`} className="text-espresso underline decoration-gold underline-offset-4 hover:text-ember">{site.email}</a>{" "}
                  within 14 days of receipt if you have an issue with your order.</li>
                <li>Digital products are delivered immediately upon payment and are non-refundable once accessed.</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-medium text-espresso">5. User Conduct</h2>
              <p>When using the Site, you agree not to:</p>
              <ul className="flex flex-col gap-2 pl-5 list-disc marker:text-gold">
                <li>Use the Site for any unlawful purpose or in violation of any applicable laws or regulations.</li>
                <li>Attempt to gain unauthorized access to any portion of the Site or its related systems.</li>
                <li>Transmit any harmful, offensive, or disruptive content through any contact or inquiry forms.</li>
                <li>Use automated tools to scrape, crawl, or harvest content from the Site without prior written permission.</li>
                <li>Impersonate {site.legalName}, its staff, or any other person or entity.</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-medium text-espresso">6. Ministry Content and Faith-Based Materials</h2>
              <p>
                The Site contains faith-based content, including sermons, teachings, prophetic messages, and ministry resources. This content is provided for spiritual encouragement and edification. It does not constitute professional counseling, legal, financial, or medical advice. You should seek qualified professionals for such matters.
              </p>
              <p>
                {site.legalName} reserves the right to update, modify, or remove any ministry content at any time without notice.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-medium text-espresso">7. Third-Party Links</h2>
              <p>
                The Site may contain links to third-party websites, including social media platforms, event registration services, and payment processors. These links are provided for your convenience only. {site.legalName} has no control over the content of those sites and accepts no responsibility for them or for any loss or damage that may arise from your use of them. Visiting any linked site is at your own risk.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-medium text-espresso">8. Disclaimer of Warranties</h2>
              <p>
                The Site and its content are provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without any warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement. {site.legalName} does not warrant that the Site will be uninterrupted, error-free, or free of viruses or other harmful components.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-medium text-espresso">9. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by applicable law, {site.legalName} shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of, or inability to use, the Site or its content, even if advised of the possibility of such damages. Our total liability to you for any claim arising from these Terms shall not exceed the amount you paid to us in the twelve months preceding the claim.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-medium text-espresso">10. Privacy</h2>
              <p>
                Your use of the Site is also governed by our{" "}
                <a href="/privacy" className="text-espresso underline decoration-gold underline-offset-4 hover:text-ember">Privacy Policy</a>,
                which is incorporated into these Terms of Use by reference.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-medium text-espresso">11. Governing Law</h2>
              <p>
                These Terms of Use shall be governed by and construed in accordance with the laws of the United States and the state of Illinois, where {site.legalName} is domiciled, without regard to its conflict of law provisions. Any dispute arising under these Terms shall be resolved exclusively in the courts of competent jurisdiction in that state.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-medium text-espresso">12. Changes to These Terms</h2>
              <p>
                {site.legalName} reserves the right to modify these Terms of Use at any time. Changes will be effective immediately upon posting to the Site with an updated effective date. Your continued use of the Site after any changes constitutes your acceptance of the revised Terms. We encourage you to review these Terms periodically.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-medium text-espresso">13. Contact Us</h2>
              <p>
                If you have any questions about these Terms of Use, please contact us at:
              </p>
              <address className="not-italic rounded-sm border border-sand bg-linen px-6 py-4 text-sm">
                <strong className="font-semibold text-espresso">{site.legalName}</strong><br />
                <a href={`mailto:${site.email}`} className="text-espresso underline decoration-gold underline-offset-4 hover:text-ember">{site.email}</a>
              </address>
            </div>

            <p className="text-sm text-stone border-t border-sand pt-6">
              Last updated: January 1, 2025
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
