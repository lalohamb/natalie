/**
 * /admin — Integration configuration placeholder.
 *
 * 🔒 TODO: Protect this route with authentication before production.
 * See CURRENT-ARCHITECTURE-CONTRACT.md — Identity Model gap (G-03).
 * Recommended: implement middleware-based auth (e.g. Clerk, NextAuth, or
 * a simple secret-token check) that redirects unauthenticated requests to /login.
 */

type IntegrationStatus = "connected" | "not-configured" | "coming-soon";

type Integration = {
  id: string;
  name: string;
  description: string;
  status: IntegrationStatus;
  configKeys?: string[];
  docsUrl?: string;
};

const integrations: Integration[] = [
  {
    id: "stripe",
    name: "Stripe",
    description: "Payment processing for donations and future book/merch checkout.",
    status: "not-configured",
    configKeys: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"],
    docsUrl: "https://stripe.com/docs",
  },
  {
    id: "mailerlite",
    name: "MailerLite",
    description: "Newsletter subscriber management and email campaigns.",
    status: "not-configured",
    configKeys: ["MAILERLITE_API_KEY", "MAILERLITE_GROUP_ID"],
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
    description: "Facebook video embeds for the Featured Message and Media page.",
    status: "not-configured",
    configKeys: ["FACEBOOK_VIDEO_URL", "FACEBOOK_APP_ID"],
    docsUrl: "https://developers.facebook.com/docs/plugins/embedded-video-player",
  },
  {
    id: "facebook",
    name: "Facebook",
    description: "Ministry Facebook Page link displayed in the footer.",
    status: "not-configured",
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
    status: "not-configured",
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

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-espresso text-mist">
      {/* Header */}
      <div className="border-b border-ivory/10 px-8 py-6">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div>
            <p className="font-sans text-xs font-semibold text-gold-light uppercase tracking-[0.2em]">
              Natalie Flemons Ministries
            </p>
            <h1 className="mt-1 font-display text-2xl font-medium text-ivory">
              Admin — Integrations
            </h1>
          </div>
          <span className="rounded border border-amber-700/50 bg-amber-900/30 px-3 py-1 font-sans text-xs font-semibold text-amber-300 uppercase tracking-wide">
            ⚠ No auth — dev only
          </span>
        </div>
      </div>

      {/* Warning banner */}
      <div className="border-b border-amber-700/30 bg-amber-900/20 px-8 py-3">
        <p className="mx-auto max-w-5xl font-sans text-xs text-amber-300">
          <strong>This page is publicly accessible.</strong> Do not enter real credentials here. Implement authentication before deploying to production. See <code className="font-mono">CURRENT-ARCHITECTURE-CONTRACT.md</code>.
        </p>
      </div>

      {/* Integration grid */}
      <div className="mx-auto max-w-5xl px-8 py-10">
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
                      className="rounded bg-ivory/5 px-2 py-1 font-mono text-[0.65rem] text-stone"
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

        <p className="mt-10 text-center font-sans text-xs text-stone">
          Configure integrations by setting environment variables in <code className="font-mono">.env.local</code>
        </p>
      </div>
    </div>
  );
}
