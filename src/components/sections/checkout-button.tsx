import { buttonClasses, type ButtonVariant } from "@/components/ui/button-link";

/**
 * "Purchase" for a book sold through Stripe Checkout.
 *
 * A real form POST rather than a link: it works without JavaScript, and
 * crawlers and link prefetchers (which only issue GETs) can never start a
 * checkout. Only the book's slug is sent — the server decides the price.
 */
export function CheckoutButton({
  slug,
  variant = "primary",
  children,
  "aria-label": ariaLabel,
}: {
  slug: string;
  variant?: ButtonVariant;
  children: React.ReactNode;
  "aria-label"?: string;
}) {
  return (
    <form method="POST" action="/api/checkout" className="contents">
      <input type="hidden" name="slug" value={slug} />
      <button type="submit" aria-label={ariaLabel} className={buttonClasses(variant, "cursor-pointer")}>
        {children}
      </button>
    </form>
  );
}
