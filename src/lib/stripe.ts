import "server-only";

const BASE = "https://api.stripe.com/v1";

function headers() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return { Authorization: `Bearer ${key}` };
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
};

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

export async function listPaymentIntents(
  limit = 100,
): Promise<{ data: StripePaymentIntent[]; has_more: boolean }> {
  const res = await fetch(
    `${BASE}/payment_intents?limit=${limit}&expand[]=data.latest_charge`,
    { headers: headers(), cache: "no-store" },
  );
  if (!res.ok) throw new Error(`Stripe /payment_intents error ${res.status}`);
  return res.json();
}

export async function listPricesByProduct(productId: string): Promise<StripePrice[]> {
  const res = await fetch(`${BASE}/prices?product=${productId}&limit=10&active=true`, {
    headers: headers(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Stripe /prices error ${res.status}`);
  const json = (await res.json()) as { data: StripePrice[] };
  return json.data;
}

/**
 * Fetch payment intents linked to a Stripe product by looking at line items
 * via checkout sessions. Falls back to filtering by metadata.product_id.
 */
export async function listOrdersByProduct(productId: string): Promise<StripePaymentIntent[]> {
  // Fetch checkout sessions for this product via line_items expansion
  const res = await fetch(
    `${BASE}/checkout/sessions?limit=100&expand[]=data.payment_intent.latest_charge&expand[]=data.line_items`,
    { headers: headers(), cache: "no-store" },
  );
  if (!res.ok) throw new Error(`Stripe /checkout/sessions error ${res.status}`);

  type Session = {
    payment_intent: StripePaymentIntent | null;
    line_items?: { data: { price: { product: string } }[] };
  };
  const json = (await res.json()) as { data: Session[] };

  return json.data
    .filter((s) =>
      s.line_items?.data.some((li) => li.price.product === productId),
    )
    .map((s) => s.payment_intent)
    .filter((pi): pi is StripePaymentIntent => pi !== null);
}
