import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { getSocialLinks } from "@/lib/content";
import { getBalance } from "@/lib/stripe";
import { AdminPageHeader } from "../../_components/admin-ui";

/**
 * /admin/integrations — integration configuration overview (read-only).
 */

export const metadata: Metadata = { title: "Integrations" };
export const instant = false;

type IntegrationStatus = "connected" | "not-configured" | "coming-soon" | "error";

type Integration = {
  id: string;
  name: string;
  description: string;
  status: IntegrationStatus;
  detail?: string;
  configKeys?: { key: string; set: boolean; note?: string }[];
  docsUrl?: string;
};

/** A feature is "connected" only when every variable it actually reads is set. */
const configured = (...values: (string | boolean | undefined)[]): boolean =>
  values.every(Boolean);

async function getStripeIntegration(): Promise<Integration> {
  const env = process.env;
  const keySet = Boolean(env.STRIPE_SECRET_KEY);
  const isLive = env.STRIPE_SECRET_KEY?.startsWith("sk_live_");
  const isTest = env.STRIPE_SECRET_KEY?.startsWith("sk_test_");
  const shippingRateSet = Boolean(env.STRIPE_SHIPPING_RATE_ID);
  const shippingRateValid = !env.STRIPE_SHIPPING_RATE_ID || /^shr_\w+$/.test(env.STRIPE_SHIPPING_RATE_ID);
  const donationLinkSet = Boolean(env.STRIPE_DONATION_PAYMENT_LINK);
  const donationLinkValid = !env.STRIPE_DONATION_PAYMENT_LINK ||
    /^https:\/\/(donate|buy)\.stripe\.com\//.test(env.STRIPE_DONATION_PAYMENT_LINK);
  const automaticTax = env.STRIPE_AUTOMATIC_TAX?.toLowerCase() === "true";
  const shippingCountries = (env.CHECKOUT_SHIPPING_COUNTRIES ?? "US,CA").split(",").map(s => s.trim().toUpperCase()).filter(Boolean);

  const configKeys: Integration["configKeys"] = [
    {
      key: "STRIPE_SECRET_KEY",
      set: keySet,
      note: !keySet ? "Required — checkout and dashboard features are disabled without this."
        : isLive ? "Live mode key (sk_live_…)"
        : isTest ? "Test mode key (sk_test_…)"
        : "Set but unrecognised prefix — expected sk_live_… or sk_test_…",
    },
    {
      key: "CHECKOUT_SHIPPING_COUNTRIES",
      set: true,
      note: `Ships to: ${shippingCountries.join(", ")} (default US, CA)`,
    },
    {
      key: "STRIPE_SHIPPING_RATE_ID",
      set: shippingRateSet,
      note: !shippingRateSet ? "Not set — no shipping fee is added at checkout."
        : !shippingRateValid ? "Invalid format — expected shr_… (Stripe Shipping Rate id)."
        : "Set — shipping fee will be added at checkout.",
    },
    {
      key: "STRIPE_AUTOMATIC_TAX",
      set: automaticTax,
      note: automaticTax
        ? "Enabled — Stripe Tax must be configured in the Stripe account."
        : "Disabled — no tax is calculated at checkout.",
    },
    {
      key: "STRIPE_DONATION_PAYMENT_LINK",
      set: donationLinkSet,
      note: !donationLinkSet ? "Not set — the default link from site.ts is used."
        : !donationLinkValid ? "Invalid — must be a donate.stripe.com or buy.stripe.com URL."
        : "Set.",
    },
  ];

  if (!keySet) {
    return {
      id: "stripe",
      name: "Stripe",
      description: "Book checkout, Donations and Book Sales dashboard views.",
      status: "not-configured",
      detail: "STRIPE_SECRET_KEY is not set. Checkout is disabled.",
      configKeys,
      docsUrl: "https://stripe.com/docs",
    };
  }

  // Live API check
  let detail: string;
  let status: IntegrationStatus;
  try {
    const balance = await getBalance();
    const available = balance.available.map(b => `${(b.amount / 100).toFixed(2)} ${b.currency.toUpperCase()}`).join(", ");
    const pending = balance.pending.map(b => `${(b.amount / 100).toFixed(2)} ${b.currency.toUpperCase()}`).join(", ");
    status = "connected";
    detail = `${isLive ? "Live" : "Test"} mode · Available: ${available || "0.00"} · Pending: ${pending || "0.00"}`;
    if (!shippingRateValid) detail += " · ⚠ STRIPE_SHIPPING_RATE_ID has invalid format.";
    if (!donationLinkValid) detail += " · ⚠ STRIPE_DONATION_PAYMENT_LINK has invalid format.";
  } catch (err) {
    status = "error";
    const msg = err instanceof Error ? err.message : String(err);
    detail = msg.includes("401") || msg.includes("403")
      ? "Authentication failed — check STRIPE_SECRET_KEY is correct and not revoked."
      : `Could not reach Stripe: ${msg}`;
  }

  return {
    id: "stripe",
    name: "Stripe",
    description: "Book checkout, Donations and Book Sales dashboard views.",
    status,
    detail,
    configKeys,
    docsUrl: "https://stripe.com/docs",
  };
}

/*
 * Every key listed here is read by the application — see .env.example.
 * Evaluated per request (inside the page) so the statuses reflect the running
 * server's environment.
 */
async function getIntegrations(): Promise<Integration[]> {
  const env = process.env;
  const socialCount = getSocialLinks().length;
  const stripe = await getStripeIntegration();

  return [
    stripe,
    {
      id: "mailerlite",
      name: "MailerLite",
      description: "Newsletter sign-up and the subscriber list in this dashboard.",
      status: configured(env.NEWSLETTER_PROVIDER === "mailerlite", env.MAILERLITE_API_KEY) ? "connected" : "not-configured",
      configKeys: [
        { key: "NEWSLETTER_PROVIDER", set: env.NEWSLETTER_PROVIDER === "mailerlite" },
        { key: "MAILERLITE_API_KEY", set: Boolean(env.MAILERLITE_API_KEY) },
        { key: "MAILERLITE_GROUP_ID", set: Boolean(env.MAILERLITE_GROUP_ID), note: "Optional" },
      ],
      docsUrl: "https://developers.mailerlite.com",
    },
    {
      id: "resend",
      name: "Resend",
      description: "Email delivery for contact form submissions.",
      status: configured(env.CONTACT_EMAIL_PROVIDER === "resend", env.RESEND_API_KEY) ? "connected" : "not-configured",
      configKeys: [
        { key: "CONTACT_EMAIL_PROVIDER", set: env.CONTACT_EMAIL_PROVIDER === "resend" },
        { key: "RESEND_API_KEY", set: Boolean(env.RESEND_API_KEY) },
        { key: "CONTACT_EMAIL_FROM", set: Boolean(env.CONTACT_EMAIL_FROM), note: "Optional — defaults to Resend test sender" },
        { key: "CONTACT_EMAIL_TO", set: Boolean(env.CONTACT_EMAIL_TO), note: "Optional — defaults to info@natalieflemons.com" },
      ],
      docsUrl: "https://resend.com/docs",
    },
    {
      id: "google-calendar",
      name: "Google Calendar",
      description: "Events page schedule — a connected Google account (see Calendar) or a public iCal feed.",
      status: env.GOOGLE_CALENDAR_ICAL_URL || (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) ? "connected" : "not-configured",
      configKeys: [
        { key: "GOOGLE_CALENDAR_ICAL_URL", set: Boolean(env.GOOGLE_CALENDAR_ICAL_URL), note: "Option A — public iCal feed" },
        { key: "GOOGLE_CLIENT_ID", set: Boolean(env.GOOGLE_CLIENT_ID), note: "Option B — OAuth" },
        { key: "GOOGLE_CLIENT_SECRET", set: Boolean(env.GOOGLE_CLIENT_SECRET), note: "Option B — OAuth" },
        { key: "GOOGLE_REDIRECT_URI", set: Boolean(env.GOOGLE_REDIRECT_URI), note: "Optional" },
      ],
      docsUrl: "https://support.google.com/calendar/answer/37083",
    },
    {
      id: "media",
      name: "Media / Video",
      description: "Video library and book covers managed from this dashboard.",
      status: "connected",
      configKeys: [
        { key: "ADMIN_PASSWORD", set: Boolean(env.ADMIN_PASSWORD) },
        { key: "ADMIN_SESSION_SECRET", set: Boolean(env.ADMIN_SESSION_SECRET), note: "Optional — defaults to ADMIN_PASSWORD" },
        { key: "MEDIA_STORAGE_DIR", set: Boolean(env.MEDIA_STORAGE_DIR), note: "Optional — defaults to ./storage" },
        { key: "MEDIA_MAX_UPLOAD_MB", set: Boolean(env.MEDIA_MAX_UPLOAD_MB), note: "Optional — defaults to 1024 MB" },
      ],
    },
    {
      id: "social",
      name: "Social links",
      description: `Facebook, Instagram and YouTube links in the footer. ${socialCount} shown. Set in src/content/site.ts.`,
      status: socialCount > 0 ? "connected" : "not-configured",
    },
    {
      id: "analytics",
      name: "Google Analytics",
      description: "Visitor analytics (GA4). Loads only when a measurement ID is set.",
      status: configured(env.NEXT_PUBLIC_GA_MEASUREMENT_ID) ? "connected" : "not-configured",
      configKeys: [
        { key: "NEXT_PUBLIC_GA_MEASUREMENT_ID", set: Boolean(env.NEXT_PUBLIC_GA_MEASUREMENT_ID) },
      ],
      docsUrl: "https://support.google.com/analytics/answer/9539598",
    },
    {
      id: "errors",
      name: "Error reporting",
      description: "Server errors are always written to the server log. Set a webhook to also be notified.",
      status: configured(env.ERROR_REPORT_WEBHOOK_URL) ? "connected" : "not-configured",
      configKeys: [
        { key: "ERROR_REPORT_WEBHOOK_URL", set: Boolean(env.ERROR_REPORT_WEBHOOK_URL) },
      ],
    },
    {
      id: "captcha",
      name: "Cloudflare Turnstile",
      description: "CAPTCHA protection for newsletter and contact forms. Not built yet.",
      status: "coming-soon",
      docsUrl: "https://developers.cloudflare.com/turnstile",
    },
  ];
}

const statusLabel: Record<IntegrationStatus, string> = {
  connected: "Connected",
  "not-configured": "Not configured",
  "coming-soon": "Coming soon",
  error: "Error",
};

const statusColor: Record<IntegrationStatus, string> = {
  connected: "bg-green-900/40 text-green-300 border-green-700/40",
  "not-configured": "bg-amber-900/30 text-amber-300 border-amber-700/40",
  "coming-soon": "bg-stone-800 text-stone-400 border-stone-700/40",
  error: "bg-red-900/40 text-red-300 border-red-700/40",
};

export default async function IntegrationsPage() {
  await requireAdmin();
  const integrations = await getIntegrations();

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

            {integration.detail && (
              <p className={`mt-2 text-xs leading-relaxed ${
                integration.status === "error" ? "text-red-300" :
                integration.status === "connected" ? "text-green-300/80" : "text-amber-300/80"
              }`}>
                {integration.detail}
              </p>
            )}

            {integration.configKeys && (
              <div className="mt-4 flex flex-col gap-1.5">
                {integration.configKeys.map(({ key, set, note }) => (
                  <div key={key}>
                    <div className="flex items-center gap-2">
                      <span className={`text-[0.6rem] ${set ? "text-green-400" : "text-amber-400"}`}>
                        {set ? "✓" : "○"}
                      </span>
                      <code className="rounded bg-ivory/5 px-2 py-0.5 font-mono text-[0.65rem] text-mist">
                        {key}
                      </code>
                    </div>
                    {note && (
                      <p className="ml-4 mt-0.5 font-sans text-[0.6rem] text-mist/70 leading-relaxed">{note}</p>
                    )}
                  </div>
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
        Configure integrations by setting environment variables on the server (locally: <code className="font-mono">.env.local</code>), then restart
      </p>
    </>
  );
}
