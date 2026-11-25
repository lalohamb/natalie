import { giving } from "@/content/site";

/** Stripe-hosted hosts a donation Payment Link can live on. */
const PAYMENT_LINK_HOSTS = new Set(["donate.stripe.com", "buy.stripe.com"]);

/**
 * STRIPE_DONATION_PAYMENT_LINK if it is a Stripe Payment Link, otherwise null.
 * The value becomes the "Give by Card" href, so anything else is ignored
 * rather than sending donors to an arbitrary address.
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

export async function getGiving() {
  return { ...giving, stripeUrl: donationLinkFromEnv() ?? giving.stripeUrl };
}
