"use client"; // Error boundaries must be Client Components

import Link from "next/link";

/**
 * Branded fallback for unexpected errors in any page. The server-side cause is
 * reported by `src/instrumentation.ts`; nothing about it is shown to visitors.
 */
export default function ErrorPage({ retry }: { error: unknown; retry: () => void }) {
  const button =
    "inline-flex min-h-12 items-center justify-center rounded-sm px-7 font-sans text-sm font-semibold tracking-[0.06em] uppercase transition-colors duration-300";

  return (
    <section aria-labelledby="error-heading" className="py-section">
      <div className="mx-auto max-w-3xl px-[var(--spacing-gutter)] text-center">
        <p className="font-sans text-eyebrow font-semibold text-gold-ink uppercase">Something went wrong</p>
        <h1 id="error-heading" className="mt-6 font-display text-display-lg font-medium">
          This page could not be loaded
        </h1>
        <p className="mx-auto mt-6 max-w-prose text-lede text-stone">
          Please try again in a moment. If the problem continues, email info@natalieflemons.com and we will help.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button type="button" onClick={() => retry()} className={`${button} bg-ember text-ivory hover:bg-ember-deep`}>
            Try again
          </button>
          <Link href="/" className={`${button} border border-espresso/80 text-espresso hover:bg-espresso hover:text-ivory`}>
            Return home
          </Link>
        </div>
      </div>
    </section>
  );
}
