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
            {site.legalName} &mdash; Effective January 1, 2025
          </p>
        </Container>
      </section>

      <section aria-labelledby="privacy-heading" className="py-section">
        <Container className="max-w-prose">
          <div className="flex flex-col gap-10 text-pretty text-stone motion-safe:animate-rise">

            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-medium text-espresso">1. Who We Are</h2>
              <p>
                {site.legalName} (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates{" "}
                <a href={site.url} className="text-espresso underline decoration-gold underline-offset-4 hover:text-ember">{site.url}</a>{" "}
                (the &ldquo;Site&rdquo;). We are a Christian ministry organization. Questions about this policy may be directed to{" "}
                <a href={`mailto:${site.email}`} className="text-espresso underline decoration-gold underline-offset-4 hover:text-ember">{site.email}</a>.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-medium text-espresso">2. Information We Collect</h2>
              <p>We collect information you provide directly to us, including:</p>
              <ul className="flex flex-col gap-2 pl-5 list-disc marker:text-gold">
                <li><strong className="font-semibold text-espresso">Contact inquiries:</strong> your name, email address, and message when you submit our contact form.</li>
                <li><strong className="font-semibold text-espresso">Newsletter sign-up:</strong> your email address when you subscribe to ministry updates.</li>
                <li><strong className="font-semibold text-espresso">Donations and purchases:</strong> billing name, email address, and payment information when you make a donation or purchase a book. Payment card data is processed directly by Stripe and is never stored on our servers.</li>
                <li><strong className="font-semibold text-espresso">Speaking inquiries:</strong> your name, organization, email address, and event details when you submit a booking inquiry.</li>
              </ul>
              <p>
                We also automatically collect certain technical information when you visit the Site, such as your IP address, browser type, referring URL, and pages visited. This information is used solely for security and to improve the Site.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-medium text-espresso">3. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="flex flex-col gap-2 pl-5 list-disc marker:text-gold">
                <li>Respond to your contact and booking inquiries.</li>
                <li>Send ministry newsletters and updates you have subscribed to.</li>
                <li>Process donations and book purchases and send receipts.</li>
                <li>Comply with legal obligations.</li>
                <li>Protect the security and integrity of the Site.</li>
              </ul>
              <p>We do not use your information for automated decision-making or profiling.</p>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-medium text-espresso">4. How We Share Your Information</h2>
              <p>
                We do not sell, rent, or trade your personal information. We share information only with trusted service providers who assist us in operating the Site, subject to confidentiality obligations:
              </p>
              <ul className="flex flex-col gap-2 pl-5 list-disc marker:text-gold">
                <li><strong className="font-semibold text-espresso">Stripe</strong> — payment processing for donations and book purchases. Stripe&rsquo;s privacy policy is available at <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-espresso underline decoration-gold underline-offset-4 hover:text-ember">stripe.com/privacy</a>.</li>
                <li><strong className="font-semibold text-espresso">MailerLite</strong> — email newsletter delivery. MailerLite&rsquo;s privacy policy is available at <a href="https://www.mailerlite.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-espresso underline decoration-gold underline-offset-4 hover:text-ember">mailerlite.com/legal/privacy-policy</a>.</li>
                <li><strong className="font-semibold text-espresso">Google</strong> — calendar integration for public event listings. Google&rsquo;s privacy policy is available at <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-espresso underline decoration-gold underline-offset-4 hover:text-ember">policies.google.com/privacy</a>.</li>
              </ul>
              <p>
                We may also disclose information if required by law or to protect the rights, property, or safety of {site.legalName}, our visitors, or others.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-medium text-espresso">5. Email Communications</h2>
              <p>
                If you subscribe to our newsletter, you may unsubscribe at any time by clicking the &ldquo;unsubscribe&rdquo; link in any email we send, or by contacting us at{" "}
                <a href={`mailto:${site.email}`} className="text-espresso underline decoration-gold underline-offset-4 hover:text-ember">{site.email}</a>.
                We will process your request promptly.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-medium text-espresso">6. Cookies</h2>
              <p>
                The Site uses only essential cookies necessary for the Site to function, including a session cookie for the admin dashboard. We do not use advertising or tracking cookies, and we do not use third-party analytics services that set cookies on your device.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-medium text-espresso">7. Data Retention</h2>
              <p>
                We retain contact and inquiry information for as long as necessary to respond to your request and for a reasonable period thereafter. Newsletter subscriber data is retained until you unsubscribe. Donation and purchase records are retained as required by applicable law and for financial record-keeping purposes.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-medium text-espresso">8. Security</h2>
              <p>
                We take reasonable technical and organizational measures to protect your information against unauthorized access, loss, or misuse. Payment transactions are encrypted and processed by Stripe using industry-standard security. However, no method of transmission over the internet is completely secure, and we cannot guarantee absolute security.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-medium text-espresso">9. Children&rsquo;s Privacy</h2>
              <p>
                The Site is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us and we will promptly delete it.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-medium text-espresso">10. Your Rights</h2>
              <p>
                You may contact us at any time to request access to, correction of, or deletion of personal information we hold about you. We will respond to all reasonable requests within a reasonable timeframe. To exercise these rights, contact us at{" "}
                <a href={`mailto:${site.email}`} className="text-espresso underline decoration-gold underline-offset-4 hover:text-ember">{site.email}</a>.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-medium text-espresso">11. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. When we do, we will revise the effective date at the top of this page. We encourage you to review this policy periodically. Continued use of the Site after any changes constitutes your acceptance of the updated policy.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-medium text-espresso">12. Contact Us</h2>
              <p>
                If you have any questions or concerns about this Privacy Policy, please contact us at:
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
