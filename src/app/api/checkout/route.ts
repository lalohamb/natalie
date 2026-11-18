import { type NextRequest, NextResponse } from "next/server";

const BASE = "https://api.stripe.com/v1";

export async function GET(req: NextRequest) {
  // Block RSC prefetch requests — this route must only be hit by real navigation.
  if (req.headers.get("rsc") || req.nextUrl.searchParams.has("_rsc")) {
    return NextResponse.json({ error: "Not prefetchable" }, { status: 400 });
  }

  const priceId = req.nextUrl.searchParams.get("priceId");
  const origin = req.nextUrl.origin;

  if (!priceId) {
    return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body = new URLSearchParams({
    mode: "payment",
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": "1",
    success_url: `${origin}/books?purchased=1`,
    cancel_url: `${origin}/books`,
  });

  const res = await fetch(`${BASE}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = (await res.json()) as { error?: { message?: string } };
    return NextResponse.json({ error: err.error?.message ?? "Stripe error" }, { status: 502 });
  }

  const session = (await res.json()) as { url: string };
  return NextResponse.redirect(session.url, 303);
}
