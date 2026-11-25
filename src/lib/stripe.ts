import "server-only";

const BASE = "https://api.stripe.com/v1";

function headers() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return { Authorization: `Bearer ${key}`, "Stripe-Version": "2025-06-30.basil" };
}

export type StripePaymentIntent = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string | null;
  receipt_email: string | null;
  created: number;
  metadata: Record<string, string>;
  latest_charge: {
    billing_details: { name: string | null; email: string | null };
    receipt_url: string | null;
  } | null;
  /** Delivery details, present when Checkout collected a shipping address. */
  shipping?: StripeShipping | null;
};

export type StripeAddress = {
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
};

export type StripeShipping = { name: string | null; address: StripeAddress | null };

export type StripePrice = {
  id: string;
  unit_amount: number | null;
  currency: string;
  nickname: string | null;
  product: string;
};

export type StripeBalance = {
  available: { amount: number; currency: string }[];
  pending: { amount: number; currency: string }[];
};

export async function getBalance(): Promise<StripeBalance> {
  const res = await fetch(`${BASE}/balance`, { headers: headers(), cache: "no-store" });
  if (!res.ok) throw new Error(`Stripe /balance error ${res.status}`);
  return res.json();
}

/** Stripe returns at most 100 objects per page; lists are followed up to this many pages. */
const MAX_PAGES = 10;

type StripeList<T> = { data: T[]; has_more: boolean };

/**
 * Follows Stripe's cursor pagination (`starting_after` + `has_more`) for a
 * list endpoint. `truncated` is true when more objects exist beyond MAX_PAGES.
 */
async function listAll<T extends { id: string }>(path: string, query: string): Promise<{ data: T[]; truncated: boolean }> {
  const data: T[] = [];
  let startingAfter: string | undefined;
  for (let page = 0; page < MAX_PAGES; page++) {
    const cursor = startingAfter ? `&starting_after=${encodeURIComponent(startingAfter)}` : "";
    const res = await fetch(`${BASE}${path}?limit=100&${query}${cursor}`, { headers: headers(), cache: "no-store" });
    if (!res.ok) throw new Error(`Stripe ${path} error ${res.status}`);
    const json = (await res.json()) as StripeList<T>;
    data.push(...json.data);
    if (!json.has_more || json.data.length === 0) return { data, truncated: false };
    startingAfter = json.data[json.data.length - 1].id;
  }
  return { data, truncated: true };
}

/** Every PaymentIntent on the account, newest first (up to MAX_PAGES × 100). */
export function listPaymentIntents(): Promise<{ data: StripePaymentIntent[]; truncated: boolean }> {
  return listAll<StripePaymentIntent>("/payment_intents", "expand[]=data.latest_charge");
}

export type StripeProduct = {
  id: string;
  name: string;
  active: boolean;
};

export type StripeCheckoutSession = {
  id: string;
  payment_status: string;
  customer_details: { name: string | null; email: string | null } | null;
  shipping_details: { name: string | null; address: StripeAddress | null } | null;
  amount_total: number | null;
  currency: string | null;
  metadata: Record<string, string>;
  line_items?: { data: { description: string | null; amount_total: number; quantity: number | null }[] };
};

/** Fetches one Checkout Session by id — used on the order confirmation page. */
export async function getCheckoutSession(sessionId: string): Promise<StripeCheckoutSession | null> {
  const res = await fetch(
    `${BASE}/checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=line_items`,
    { headers: headers(), cache: "no-store" },
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Stripe /checkout/sessions error ${res.status}`);
  return res.json();
}

/** Active products on the account, for the admin book-form picker. */
export async function listStripeProducts(): Promise<StripeProduct[]> {
  const { data } = await listAll<StripeProduct>("/products", "active=true");
  return data.sort((a, b) => a.name.localeCompare(b.name));
}

/** Active prices for one product, for the admin book-form picker. */
export async function listStripeProductPrices(productId: string): Promise<StripePrice[]> {
  const { data } = await listAll<StripePrice>("/prices", `product=${encodeURIComponent(productId)}&active=true`);
  return data;
}

/** Looks up one Price — used to check a book's display price against what Stripe will charge. */
export async function getPrice(priceId: string): Promise<(StripePrice & { active: boolean }) | null> {
  const res = await fetch(`${BASE}/prices/${encodeURIComponent(priceId)}`, { headers: headers(), cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Stripe /prices error ${res.status}`);
  return res.json();
}

export type StripeCheckoutOrder = {
  sessionId: string;
  /** Null until the buyer completes payment. */
  paymentIntent: StripePaymentIntent | null;
  /** Where to send the order. Null when no address was collected. */
  shipping: StripeShipping | null;
  productIds: string[];
  priceIds: string[];
};

/**
 * Checkout Sessions with what was bought in each, newest first. Book orders
 * and Payment Link donations both appear here; callers tell them apart by
 * product / price id.
 */
export async function listCheckoutOrders(): Promise<{ data: StripeCheckoutOrder[]; truncated: boolean }> {
  type Session = {
    id: string;
    payment_intent: StripePaymentIntent | null;
    line_items?: { data: { price: { id: string; product: string } | null }[] };
    // Stripe has reported the collected address in different places across
    // API versions; all are read, none is assumed.
    collected_information?: { shipping_details?: StripeShipping | null } | null;
    shipping_details?: StripeShipping | null;
  };
  const { data, truncated } = await listAll<Session>(
    "/checkout/sessions",
    "expand[]=data.payment_intent.latest_charge&expand[]=data.line_items",
  );
  return {
    truncated,
    data: data.map((s) => {
      const prices = (s.line_items?.data ?? []).flatMap((li) => (li.price ? [li.price] : []));
      return {
        sessionId: s.id,
        paymentIntent: s.payment_intent,
        shipping: s.payment_intent?.shipping ?? s.collected_information?.shipping_details ?? s.shipping_details ?? null,
        productIds: prices.map((p) => p.product),
        priceIds: prices.map((p) => p.id),
      };
    }),
  };
}

// ---------------------------------------------------------------------------
// Book checkout
// ---------------------------------------------------------------------------

/** Books are shipped to these countries unless CHECKOUT_SHIPPING_COUNTRIES says otherwise. */
const DEFAULT_SHIPPING_COUNTRIES = ["US", "CA"];

export type CheckoutFulfilment = {
  /** ISO 3166-1 alpha-2 codes Checkout accepts as a delivery address. Never empty. */
  shippingCountries: string[];
  /** Stripe Shipping Rate (`shr_…`) added to every order; undefined = no shipping fee line. */
  shippingRateId?: string;
  /** Ask Stripe Tax to calculate tax. Requires Stripe Tax to be set up in the account. */
  automaticTax: boolean;
};

/**
 * How book orders are delivered and charged, from the environment:
 *
 *   CHECKOUT_SHIPPING_COUNTRIES   comma-separated country codes (default "US,CA")
 *   STRIPE_SHIPPING_RATE_ID       optional Stripe Shipping Rate id
 *   STRIPE_AUTOMATIC_TAX          "true" to enable Stripe Tax
 *
 * Books are physical, so a delivery address is always collected: a malformed
 * country list falls back to the default rather than to "no address".
 */
export function checkoutFulfilment(): CheckoutFulfilment {
  const countries = (process.env.CHECKOUT_SHIPPING_COUNTRIES ?? "")
    .split(",")
    .map((code) => code.trim().toUpperCase())
    .filter((code) => /^[A-Z]{2}$/.test(code));

  const rate = process.env.STRIPE_SHIPPING_RATE_ID?.trim();
  if (rate && !/^shr_\w+$/.test(rate)) {
    console.error("[checkout] STRIPE_SHIPPING_RATE_ID is not a Stripe Shipping Rate id (shr_…); no shipping fee will be added.");
  }

  return {
    shippingCountries: countries.length > 0 ? [...new Set(countries)] : DEFAULT_SHIPPING_COUNTRIES,
    shippingRateId: rate && /^shr_\w+$/.test(rate) ? rate : undefined,
    automaticTax: process.env.STRIPE_AUTOMATIC_TAX?.trim().toLowerCase() === "true",
  };
}

export type CheckoutSessionResult = { ok: true; url: string } | { ok: false; reason: "stripe-error" };

/**
 * Creates a Stripe-hosted Checkout Session for one unit of one Price and
 * returns the URL to send the buyer to. The amount is whatever the Price says —
 * no amount is ever sent from here. Callers must pass a price id they resolved
 * themselves from the book store, never one supplied by the browser.
 */
export async function createCheckoutSession(input: {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  /** Recorded on the session so an order can be traced back to a catalog book. */
  bookSlug: string;
  fulfilment: CheckoutFulfilment;
}): Promise<CheckoutSessionResult> {
  const params = new URLSearchParams({
    mode: "payment",
    "line_items[0][price]": input.priceId,
    "line_items[0][quantity]": "1",
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    "metadata[book_slug]": input.bookSlug,
  });
  // The buyer must give a delivery address in one of the countries we ship to.
  input.fulfilment.shippingCountries.forEach((country, i) => {
    params.set(`shipping_address_collection[allowed_countries][${i}]`, country);
  });
  if (input.fulfilment.shippingRateId) params.set("shipping_options[0][shipping_rate]", input.fulfilment.shippingRateId);
  if (input.fulfilment.automaticTax) params.set("automatic_tax[enabled]", "true");

  const res = await fetch(`${BASE}/checkout/sessions`, {
    method: "POST",
    headers: { ...headers(), "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
    cache: "no-store",
  });

  if (!res.ok) {
    // Logged for the operator; Stripe's message is never shown to visitors.
    console.error("[checkout] Stripe error", res.status, await res.text());
    return { ok: false, reason: "stripe-error" };
  }
  const session = (await res.json()) as { url?: string | null };
  if (!session.url) {
    console.error("[checkout] Stripe returned a session without a URL");
    return { ok: false, reason: "stripe-error" };
  }
  return { ok: true, url: session.url };
}
