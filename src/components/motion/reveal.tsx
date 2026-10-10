"use client";

import { domAnimation, LazyMotion, m } from "motion/react";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Seconds before the reveal starts, for gentle staggering. */
  delay?: number;
};

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Subtle fade + slide-up as a section scrolls into view. Use below the fold
 * only — above-the-fold content uses the CSS `animate-rise` utility so it
 * paints without waiting for hydration.
 *
 * Server and client always render the same markup. Reduced-motion and no-JS
 * visitors are handled in CSS (globals.css and the root layout's <noscript>),
 * which force `[data-reveal]` content visible — branching on
 * `useReducedMotion()` here caused a hydration mismatch that left content hidden.
 */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        data-reveal=""
        className={className}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        transition={{ duration: 0.8, ease, delay }}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}
