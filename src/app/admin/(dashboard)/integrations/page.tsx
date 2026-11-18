import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminPageHeader } from "../../_components/admin-ui";

/**
 * /admin/integrations — integration configuration overview (read-only).
 */

export const metadata: Metadata = { title: "Integrations" };

type IntegrationStatus = "connected" | "not-configured" | "coming-soon";

type Integration = {
  id: string;
  name: string;
  description: string;
  status: IntegrationStatus;
  configKeys?: string[];
  docsUrl?: string;
};

function status(envKey: string): IntegrationStatus {
  return process.env[envKey] ? "connected" : "not-configured";
}

const integrations: Integration[] = [
  {
    id: "stripe",
    name: "Stripe",
    description: "Payment processing for donations and future book/merch checkout.",
    status: status("STRIPE_SECRET_KEY"),
    configKeys: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"],
    docsUrl: "https://stripe.com/docs",
  },
  {
    id: "mailerlite",
    name: "MailerLite",
    description: "Newsletter subscriber management and email campaigns.",
    status: "connected",
    configKeys: ["MAILERLITE_API_KEY", "NEWSLETTER_PROVIDER"],
    docsUrl: "https://developers.mailerlite.com",
  },
  {
    id: "resend",
    name: "Resend",
    description: "Transactional email delivery for contact form submissions.",
    status: "not-configured",
    configKeys: ["RESEND_API_KEY", "CONTACT_EMAIL_TO"],
    docsUrl: "https://resend.com/docs",
  },
  {
    id: "media",
    name: "Media / Video",
    description: "Video library managed from this dashboard: uploaded files, YouTube links and Facebook videos. Uploads are stored in MEDIA_STORAGE_DIR.",
    status: "connected",
    configKeys: ["ADMIN_PASSWORD", "MEDIA_STORAGE_DIR", "MEDIA_MAX_UPLOAD_MB"],
  },
  {
    id: "facebook",
    name: "Facebook",
    description: "Ministry Facebook Page link displayed in the footer.",
    status: status("NEXT_PUBLIC_FACEBOOK_URL"),
    configKeys: ["NEXT_PUBLIC_FACEBOOK_URL"],
    docsUrl: "https://facebook.com",
  },
  {
    id: "instagram",
    name: "Instagram",
    description: "Ministry Instagram profile link displayed in the footer.",
    status: "connected",
    configKeys: ["NEXT_PUBLIC_INSTAGRAM_URL"],
    docsUrl: "https://instagram.com",
  },
  {
    id: "youtube",
    name: "YouTube",
    description: "Ministry YouTube channel link displayed in the footer.",
    status: status("NEXT_PUBLIC_YOUTUBE_URL"),
    configKeys: ["NEXT_PUBLIC_YOUTUBE_URL"],
    docsUrl: "https://youtube.com",
  },
  {
    id: "analytics",
    name: "Analytics",
    description: "Site traffic and visitor analytics.",
    status: "coming-soon",
    configKeys: ["NEXT_PUBLIC_GA_MEASUREMENT_ID"],
    docsUrl: "https://analytics.google.com",
  },
  {
    id: "captcha",
    name: "Cloudflare Turnstile",
    description: "CAPTCHA protection for newsletter and contact forms.",
    status: "coming-soon",
    configKeys: ["NEXT_PUBLIC_TURNSTILE_SITE_KEY", "TURNSTILE_SECRET_KEY"],
    docsUrl: "https://developers.cloudflare.com/turnstile",
  },
];

const statusLabel: Record<IntegrationStatus, string> = {
  connected: "Connected",
  "not-configured": "Not configured",
  "coming-soon": "Coming soon",
};

const statusColor: Record<IntegrationStatus, string> = {
  connected: "bg-green-900/40 text-green-300 border-green-700/40",
  "not-configured": "bg-amber-900/30 text-amber-300 border-amber-700/40",
  "coming-soon": "bg-stone-800 text-stone-400 border-stone-700/40",
};

export default async function IntegrationsPage() {
  await requireAdmin();

  return (
    <>
      <AdminPageHeader
        title="Integrations"
        description="Third-party services and the environment variables that configure them."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className="flex flex-col rounded border border-ivory/10 bg-ivory/5 p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-sans text-sm font-semibold text-ivory">
                {integration.name}
              </h2>
              <span
                className={`shrink-0 rounded border px-2 py-0.5 font-sans text-[0.65rem] font-semibold uppercase tracking-wide ${statusColor[integration.status]}`}
              >
                {statusLabel[integration.status]}
              </span>
            </div>

            <p className="mt-2 text-xs text-mist leading-relaxed">
              {integration.description}
            </p>

            {integration.configKeys && (
              <div className="mt-4 flex flex-col gap-1">
                {integration.configKeys.map((key) => (
                  <code
                    key={key}
                    className="rounded bg-ivory/5 px-2 py-1 font-mono text-[0.65rem] text-mist"
                  >
                    {key}
                  </code>
                ))}
              </div>
            )}

            <div className="mt-auto pt-4">
              {integration.docsUrl && (
                <a
                  href={integration.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans text-xs font-semibold text-gold-light underline underline-offset-4 hover:text-ivory"
                >
                  View docs ↗
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-10 text-center font-sans text-xs text-mist">
        Configure integrations by setting environment variables in <code className="font-mono">.env.local</code>
      </p>
    </>
  );
}
