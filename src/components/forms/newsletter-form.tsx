"use client";

import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useActionState, useId } from "react";
import { subscribe, type NewsletterState } from "@/app/actions/newsletter";
import { cn } from "@/lib/cn";

const initialState: NewsletterState = { status: "idle" };

export function NewsletterForm({ className }: { className?: string }) {
  const [state, action, pending] = useActionState(subscribe, initialState);
  const id = useId();
  const emailId = `${id}-email`;
  const errorId = `${id}-error`;
  const consentId = `${id}-consent`;
  const fieldError = state.status === "error" ? state.fieldError : undefined;

  if (state.status === "success") {
    return (
      <p role="status" className={cn("font-display text-2xl text-ivory italic", className)}>
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} noValidate className={className}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label htmlFor={emailId} className="sr-only">
            Email address
          </label>
          <input
            id={emailId}
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Your email address"
            aria-invalid={fieldError ? true : undefined}
            aria-describedby={cn(consentId, state.status === "error" && errorId)}
            className="h-13 w-full rounded-sm border border-ivory/30 bg-transparent px-5 text-ivory placeholder:text-mist/80 focus:border-gold-light focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-light aria-invalid:border-[#f0a58a]"
          />
        </div>

        {/* Honeypot — hidden from people and assistive tech, attractive to bots. */}
        <div aria-hidden="true" hidden>
          <label htmlFor={`${id}-hp`}>Leave this field empty</label>
          <input id={`${id}-hp`} name="nfm_hp" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-13 items-center justify-center gap-2 rounded-sm bg-ivory px-8 font-sans text-sm font-semibold tracking-[0.06em] text-espresso uppercase transition-colors hover:bg-linen focus-visible:outline-gold-light disabled:cursor-wait disabled:opacity-80"
        >
          {pending && <LoaderCircle aria-hidden className="size-4 animate-spin" />}
          {pending ? "Signing up…" : "Sign Up"}
        </button>
      </div>

      <div aria-live="polite" className="mt-4 min-h-6">
        {state.status === "error" && (
          <p id={errorId} className="text-sm text-[#f6c3ae]">
            {fieldError ?? state.message}
          </p>
        )}
      </div>

      <p id={consentId} className="mt-2 text-xs leading-relaxed text-mist">
        By signing up, you agree to receive email from Natalie Flemons Ministries. You can unsubscribe at any
        time. We respect your privacy — see our{" "}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-ivory">
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}
