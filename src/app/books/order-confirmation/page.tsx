import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button-link";
import { getCheckoutSession } from "@/lib/stripe";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Order Confirmed" };
export const instant = false;

type Props = { searchParams: Promise<{ session_id?: string; checkout?: string }> };

export default async function OrderConfirmationPage({ searchParams }: Props) {
  const { session_id, checkout } = await searchParams;

  // Error states from the checkout route — not a completed purchase
  if (checkout === "unavailable" || checkout === "busy") {
    const message =
      checkout === "busy"
        ? "Too many checkout attempts in a short time. You have not been charged — please wait a few minutes and try again."
        : "Checkout isn't available right now and you have not been charged. Please try again in a few minutes, or email info@natalieflemons.com and we will help you order.";
    return (
      <Container className="py-section max-w-xl">
        <p role="alert" className="border-l-2 border-ember bg-linen px-5 py-4 text-sm text-espresso">
          {message}
        </p>
        <div className="mt-8">
          <ButtonLink href="/books">Back to Books</ButtonLink>
        </div>
      </Container>
    );
  }

  if (!session_id) redirect("/books");

  let session;
  try {
    session = await getCheckoutSession(session_id);
  } catch {
    redirect("/books");
  }

  if (!session || session.payment_status !== "paid") redirect("/books");

  const bookSlug = session.metadata?.book_slug;
  const name = session.customer_details?.name ?? session.shipping_details?.name;
  const address = session.shipping_details?.address;
  const items = session.line_items?.data ?? [];

  return (
    <Container className="py-section max-w-xl">
      <div className="flex flex-col gap-8">
        <div>
          <p className="font-sans text-eyebrow font-semibold uppercase text-gold-ink tracking-[0.22em]">
            Order Confirmed
          </p>
          <h1 className="mt-4 font-display text-display-md font-medium text-espresso">
            Thank you{name ? `, ${name.split(" ")[0]}` : ""}!
          </h1>
          <p className="mt-4 text-stone">
            Your order is confirmed. You will receive a receipt from Stripe at your email address.
            Natalie will ship your order to the address below.
          </p>
        </div>

        {/* Order summary */}
        {items.length > 0 && (
          <div className="rounded border border-sand bg-linen p-6 flex flex-col gap-3">
            <p className="font-sans text-xs font-semibold uppercase tracking-widest text-stone">Order summary</p>
            {items.map((item, i) => (
              <div key={i} className="flex justify-between gap-4 text-sm text-espresso">
                <span>{item.description ?? "Book"}{item.quantity && item.quantity > 1 ? ` × ${item.quantity}` : ""}</span>
                <span className="tabular-nums">{formatPrice(item.amount_total)}</span>
              </div>
            ))}
            {session.amount_total !== null && (
              <div className="flex justify-between gap-4 border-t border-sand pt-3 font-semibold text-espresso">
                <span>Total</span>
                <span className="tabular-nums">{formatPrice(session.amount_total)}</span>
              </div>
            )}
          </div>
        )}

        {/* Shipping address */}
        {address && (
          <div className="rounded border border-sand bg-linen p-6">
            <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-widest text-stone">Ships to</p>
            <address className="not-italic text-sm text-espresso leading-relaxed">
              {session.shipping_details?.name && <p>{session.shipping_details.name}</p>}
              {address.line1 && <p>{address.line1}</p>}
              {address.line2 && <p>{address.line2}</p>}
              {(address.city || address.state || address.postal_code) && (
                <p>{[address.city, address.state, address.postal_code].filter(Boolean).join(", ")}</p>
              )}
              {address.country && <p>{address.country}</p>}
            </address>
          </div>
        )}

        <div className="flex flex-wrap gap-4">
          {bookSlug && (
            <ButtonLink href={`/books/${bookSlug}`}>Back to book</ButtonLink>
          )}
          <Link href="/books" className="self-center font-sans text-sm text-stone underline underline-offset-4 hover:text-espresso">
            Browse all books
          </Link>
        </div>
      </div>
    </Container>
  );
}
