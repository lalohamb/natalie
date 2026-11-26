import "server-only";

import fs from "node:fs/promises";
import { cacheTag } from "next/cache";
import { z } from "zod";
import { STORAGE_DIR, dataPath, writeFileAtomic } from "@/lib/storage";

const MANIFEST_PATH = dataPath(STORAGE_DIR, "legal.json");

export const LEGAL_CACHE_TAG = "legal";

const sectionSchema = z.object({
  heading: z.string().min(1).max(200),
  paragraphs: z.array(z.string().min(1)),
});

const documentSchema = z.object({
  effectiveDate: z.string().max(60),
  sections: z.array(sectionSchema),
});

const legalSchema = z.object({
  privacy: documentSchema,
  terms: documentSchema,
});

export type LegalSection = z.infer<typeof sectionSchema>;
export type LegalDocument = z.infer<typeof documentSchema>;
export type LegalData = z.infer<typeof legalSchema>;

function seed(): LegalData {
  return {
    privacy: {
      effectiveDate: "January 1, 2025",
      sections: [
        { heading: "1. Who We Are", paragraphs: ["Natalie Flemons Ministries (\u201cwe,\u201d \u201cus,\u201d or \u201cour\u201d) operates this website. We are a Christian ministry organization. Questions about this policy may be directed to our contact email."] },
        { heading: "2. Information We Collect", paragraphs: ["We collect information you provide directly to us, including contact inquiries (name, email, message), newsletter sign-ups (email), donations and purchases (billing name, email — payment card data is processed by Stripe and never stored on our servers), and speaking inquiries (name, organization, email, event details).", "We also automatically collect certain technical information when you visit the site, such as your IP address, browser type, referring URL, and pages visited. This information is used solely for security and to improve the site."] },
        { heading: "3. How We Use Your Information", paragraphs: ["We use the information we collect to respond to your contact and booking inquiries, send ministry newsletters and updates you have subscribed to, process donations and book purchases and send receipts, comply with legal obligations, and protect the security and integrity of the site.", "We do not use your information for automated decision-making or profiling."] },
        { heading: "4. How We Share Your Information", paragraphs: ["We do not sell, rent, or trade your personal information. We share information only with trusted service providers: Stripe (payment processing), MailerLite (email newsletter delivery), and Google (calendar integration for public event listings).", "We may also disclose information if required by law or to protect the rights, property, or safety of Natalie Flemons Ministries, our visitors, or others."] },
        { heading: "5. Email Communications", paragraphs: ["If you subscribe to our newsletter, you may unsubscribe at any time by clicking the unsubscribe link in any email we send, or by contacting us directly. We will process your request promptly."] },
        { heading: "6. Cookies", paragraphs: ["The site uses only essential cookies necessary for the site to function, including a session cookie for the admin dashboard. We do not use advertising or tracking cookies, and we do not use third-party analytics services that set cookies on your device."] },
        { heading: "7. Data Retention", paragraphs: ["We retain contact and inquiry information for as long as necessary to respond to your request and for a reasonable period thereafter. Newsletter subscriber data is retained until you unsubscribe. Donation and purchase records are retained as required by applicable law and for financial record-keeping purposes."] },
        { heading: "8. Security", paragraphs: ["We take reasonable technical and organizational measures to protect your information against unauthorized access, loss, or misuse. Payment transactions are encrypted and processed by Stripe using industry-standard security. However, no method of transmission over the internet is completely secure, and we cannot guarantee absolute security."] },
        { heading: "9. Children's Privacy", paragraphs: ["The site is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us and we will promptly delete it."] },
        { heading: "10. Your Rights", paragraphs: ["You may contact us at any time to request access to, correction of, or deletion of personal information we hold about you. We will respond to all reasonable requests within a reasonable timeframe."] },
        { heading: "11. Changes to This Policy", paragraphs: ["We may update this Privacy Policy from time to time. When we do, we will revise the effective date at the top of this page. Continued use of the site after any changes constitutes your acceptance of the updated policy."] },
        { heading: "12. Contact Us", paragraphs: ["If you have any questions or concerns about this Privacy Policy, please contact us via the contact form on this site."] },
      ],
    },
    terms: {
      effectiveDate: "January 1, 2025",
      sections: [
        { heading: "1. Acceptance of Terms", paragraphs: ["By accessing or using this site, you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using the site."] },
        { heading: "2. About This Ministry", paragraphs: ["Natalie Flemons Ministries is a Christian ministry organization dedicated to equipping, restoring, and activating believers. The site provides information about ministry activities, events, publications, and resources, and facilitates donations and book purchases."] },
        { heading: "3. Intellectual Property", paragraphs: ["All content on the site — including text, graphics, logos, images, audio clips, book descriptions, sermon content, and ministry materials — is the property of Natalie Flemons Ministries or its content suppliers and is protected by applicable copyright and intellectual property laws.", "You may view, download, and print content for your personal, non-commercial use only, provided you do not modify the content and you retain all copyright and proprietary notices. Any other use requires prior written permission."] },
        { heading: "4. Purchases and Donations", paragraphs: ["All transactions are processed securely through Stripe. Prices are listed in US dollars and are subject to change without notice. Donations are made voluntarily and are non-refundable unless required by applicable law.", "For physical book purchases, please contact us within 14 days of receipt if you have an issue with your order. Digital products are delivered immediately upon payment and are non-refundable once accessed."] },
        { heading: "5. User Conduct", paragraphs: ["When using the site, you agree not to use it for any unlawful purpose, attempt to gain unauthorized access to any portion of the site, transmit harmful or offensive content through any contact forms, use automated tools to scrape content without prior written permission, or impersonate Natalie Flemons Ministries or any other person or entity."] },
        { heading: "6. Ministry Content and Faith-Based Materials", paragraphs: ["The site contains faith-based content, including sermons, teachings, prophetic messages, and ministry resources. This content is provided for spiritual encouragement and edification. It does not constitute professional counseling, legal, financial, or medical advice.", "Natalie Flemons Ministries reserves the right to update, modify, or remove any ministry content at any time without notice."] },
        { heading: "7. Third-Party Links", paragraphs: ["The site may contain links to third-party websites, including social media platforms, event registration services, and payment processors. These links are provided for your convenience only. Natalie Flemons Ministries has no control over the content of those sites and accepts no responsibility for them."] },
        { heading: "8. Disclaimer of Warranties", paragraphs: ["The site and its content are provided on an \u201cas is\u201d and \u201cas available\u201d basis without any warranties of any kind, either express or implied. Natalie Flemons Ministries does not warrant that the site will be uninterrupted, error-free, or free of viruses or other harmful components."] },
        { heading: "9. Limitation of Liability", paragraphs: ["To the fullest extent permitted by applicable law, Natalie Flemons Ministries shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of, or inability to use, the site or its content."] },
        { heading: "10. Privacy", paragraphs: ["Your use of the site is also governed by our Privacy Policy, which is incorporated into these Terms of Use by reference."] },
        { heading: "11. Governing Law", paragraphs: ["These Terms of Use shall be governed by and construed in accordance with the laws of the United States and the state of Illinois, without regard to its conflict of law provisions."] },
        { heading: "12. Changes to These Terms", paragraphs: ["Natalie Flemons Ministries reserves the right to modify these Terms of Use at any time. Changes will be effective immediately upon posting to the site with an updated effective date. Your continued use of the site after any changes constitutes your acceptance of the revised Terms."] },
        { heading: "13. Contact Us", paragraphs: ["If you have any questions about these Terms of Use, please contact us via the contact form on this site."] },
      ],
    },
  };
}

export async function readLegal(): Promise<LegalData> {
  "use cache";
  cacheTag(LEGAL_CACHE_TAG);
  let raw: string;
  try {
    raw = await fs.readFile(MANIFEST_PATH, "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return seed();
    throw err;
  }
  return legalSchema.parse(JSON.parse(raw));
}

let writeQueue: Promise<unknown> = Promise.resolve();

export function updateLegal(mutate: (data: LegalData) => void): Promise<void> {
  const run = writeQueue.then(async () => {
    const data = await readLegal();
    mutate(data);
    await writeFileAtomic(MANIFEST_PATH, JSON.stringify(legalSchema.parse(data), null, 2) + "\n");
  });
  writeQueue = run.catch(() => {});
  return run;
}
