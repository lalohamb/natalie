import { giving } from "@/content/site";

/** Stripe-hosted hosts a donation Payment Link can live on. */
const PAYMENT_LINK_HOSTS = new Set(["donate.stripe.com", "buy.stripe.com"]);

/**
 * STRIPE_DONATION_PAYMENT_LINK if it is a Stripe Payment Link, otherwise null.
 */
export function donationLinkFromEnv(): string | null {
  const value = process.env.STRIPE_DONATION_PAYMENT_LINK?.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol === "https:" && PAYMENT_LINK_HOSTS.has(url.hostname)) return url.toString();
  } catch {
    // fall through
  }
  console.error("[giving] STRIPE_DONATION_PAYMENT_LINK is not a donate.stripe.com / buy.stripe.com URL; using the default link.");
  return null;
}

/**
 * The Zelle recipient (email or phone) shown on the partnerships page.
 * ZELLE_RECIPIENT overrides the default from site.ts.
 */
export function zelleRecipient(): string {
  return process.env.ZELLE_RECIPIENT?.trim() || giving.zelleEmail;
}

export async function getGiving() {
  return {
    ...giving,
    stripeUrl: donationLinkFromEnv() ?? giving.stripeUrl,
    zelleRecipient: zelleRecipient(),
  };
}
