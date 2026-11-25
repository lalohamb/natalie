"use client";

import { useSearchParams } from "next/navigation";

const MESSAGES: Record<string, string> = {
  purchased:
    "Thank you for your purchase! You will receive a receipt from Stripe by email. Natalie will ship your order to the address you provided.",
  unavailable:
    "Checkout isn’t available right now and you have not been charged. Please try again in a few minutes, or email info@natalieflemons.com and we will help you order.",
  busy: "Too many checkout attempts in a short time. You have not been charged — please wait a few minutes and try again.",
};

/**
 * Shown on a book page when /api/checkout sent the buyer back without
 * reaching Stripe (`?checkout=unavailable|busy`). Reads the query string in
 * the browser so the book page itself stays statically rendered; render it
 * inside <Suspense>.
 */
export function CheckoutNotice() {
  const message = MESSAGES[useSearchParams().get("checkout") ?? ""];
  if (!message) return null;
  return (
    <p role="alert" className="mt-6 border-l-2 border-ember bg-linen px-5 py-4 text-sm text-espresso">
      {message}
    </p>
  );
}
