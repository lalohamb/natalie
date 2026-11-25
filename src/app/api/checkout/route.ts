import { type NextRequest, NextResponse } from "next/server";
import { getAdminBook } from "@/lib/book-content";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";
import { checkoutFulfilment, createCheckoutSession } from "@/lib/stripe";

/*
 * POST /api/checkout — starts Stripe Checkout for one catalog book.
 *
 * The browser says only WHICH BOOK (form field `slug`). The Stripe price is
 * looked up here from the book store, and only a book that is published and
 * set up for Stripe Checkout can be bought. Stripe collects the delivery
 * address (countries, shipping fee and tax come from `checkoutFulfilment()`). A price id sent by the browser is
 * never read, so this endpoint cannot be used to buy anything else in the
 * Stripe account.
 *
 * POST only: links, crawlers and prefetchers issue GETs, which this route does
 * not answer, so they can never create a session.
 *
 * Outcomes:
 *   303 → Stripe Checkout                         session created
 *   303 → /books/<slug>?checkout=unavailable      Stripe not configured or Stripe refused
 *   303 → /books/<slug>?checkout=busy             rate limit reached
 *   404                                           no such purchasable book
 *   400                                           no slug in the request
 */

/** Per client: 10 checkout starts every 10 minutes. */
const limiter = createRateLimiter({ limit: 10, windowMs: 10 * 60 * 1000 });

const SLUG = /^[a-z0-9][a-z0-9_-]{0,120}$/;

export async function POST(request: NextRequest) {
  let slug: string;
  try {
    slug = String((await request.formData()).get("slug") ?? "");
  } catch {
    return NextResponse.json({ error: "Expected a form submission." }, { status: 400 });
  }
  if (!SLUG.test(slug)) return NextResponse.json({ error: "Missing or invalid book." }, { status: 400 });

  const book = await getAdminBook(slug);
  if (!book || book.status !== "published" || book.purchase.kind !== "stripe-checkout" || !book.purchase.priceId) {
    return NextResponse.json({ error: "This book is not available for purchase." }, { status: 404 });
  }

  const origin = request.nextUrl.origin;
  const bookUrl = `${origin}/books/${book.slug}`;
  const back = (state: "unavailable" | "busy") => NextResponse.redirect(`${origin}/books/order-confirmation?checkout=${state}`, 303);

  if (!limiter.hit(clientIp(request.headers))) return back("busy");

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("[checkout] STRIPE_SECRET_KEY is not set");
    return back("unavailable");
  }

  let result;
  try {
    result = await createCheckoutSession({
      priceId: book.purchase.priceId,
      successUrl: `${origin}/books/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: bookUrl,
      bookSlug: book.slug,
      fulfilment: checkoutFulfilment(),
    });
  } catch (err) {
    console.error("[checkout] could not reach Stripe", err);
    return back("unavailable");
  }

  if (!result.ok) return back("unavailable");
  // Return JSON so the client can read the Stripe URL without opaque-redirect restrictions.
  return NextResponse.json({ url: result.url });
}
