"use client";

import { useState } from "react";
import { buttonClasses, type ButtonVariant } from "@/components/ui/button-link";

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
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        body: new FormData(e.currentTarget),
      });
      const { url } = await res.json() as { url?: string };
      window.location.href = url ?? `/books/order-confirmation?checkout=unavailable`;
    } catch {
      window.location.href = `/books/order-confirmation?checkout=unavailable`;
    }
  }

  return (
    <form onSubmit={handleSubmit} className="contents">
      <input type="hidden" name="slug" value={slug} />
      <button
        type="submit"
        aria-label={ariaLabel}
        disabled={submitting}
        className={buttonClasses(variant, `cursor-pointer transition-opacity duration-200${submitting ? " opacity-60" : ""}`)}
      >
        {submitting ? "Redirecting…" : children}
      </button>
    </form>
  );
}
