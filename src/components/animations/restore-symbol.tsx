"use client";

import { m, LazyMotion, domAnimation } from "motion/react";

/**
 * RESTORE — Growing Branch
 * Meaning: renewal, restoration, purity, integrity.
 * Stem draws upward first, then three leaves unfold sequentially.
 * Purely decorative — hidden from assistive technology.
 */
export function RestoreSymbol({
  inView,
  delay = 0,
}: {
  inView: boolean;
  delay?: number;
}) {
  const ease = [0.22, 1, 0.36, 1] as const;

  const stroke = {
    stroke: "#d4b46a",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 48 56"
      className="w-12 h-auto"
      style={{ overflow: "visible" }}
    >
      <LazyMotion features={domAnimation} strict>
        {/* Main stem — draws upward */}
        <m.path
          d="M24 52 C24 52 24 44 24 28 C24 18 24 10 24 8"
          {...stroke}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={inView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 0.65, ease, delay }}
        />
        {/* Left branch */}
        <m.path
          d="M24 32 C20 30 14 28 10 24"
          {...stroke}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={inView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 0.45, ease, delay: delay + 0.5 }}
        />
        {/* Right branch */}
        <m.path
          d="M24 24 C28 22 34 20 38 16"
          {...stroke}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={inView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 0.45, ease, delay: delay + 0.62 }}
        />
        {/* Top branch */}
        <m.path
          d="M24 16 C22 13 18 10 16 8"
          {...stroke}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={inView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 0.35, ease, delay: delay + 0.72 }}
        />
        {/* Leaf 1 — left */}
        <m.path
          d="M10 24 C8 20 10 16 14 18 C16 22 14 26 10 24 Z"
          {...stroke}
          strokeOpacity={0.85}
          initial={{ pathLength: 0, opacity: 0, scale: 0.6 }}
          animate={inView ? { pathLength: 1, opacity: 1, scale: 1 } : {}}
          style={{ transformOrigin: "12px 21px" }}
          transition={{ duration: 0.5, ease, delay: delay + 0.7 }}
        />
        {/* Leaf 2 — right */}
        <m.path
          d="M38 16 C40 12 44 12 44 16 C42 20 38 20 38 16 Z"
          {...stroke}
          strokeOpacity={0.85}
          initial={{ pathLength: 0, opacity: 0, scale: 0.6 }}
          animate={inView ? { pathLength: 1, opacity: 1, scale: 1 } : {}}
          style={{ transformOrigin: "41px 16px" }}
          transition={{ duration: 0.5, ease, delay: delay + 0.82 }}
        />
        {/* Leaf 3 — top */}
        <m.path
          d="M16 8 C14 4 16 2 20 4 C20 8 18 10 16 8 Z"
          {...stroke}
          strokeOpacity={0.85}
          initial={{ pathLength: 0, opacity: 0, scale: 0.6 }}
          animate={inView ? { pathLength: 1, opacity: 1, scale: 1 } : {}}
          style={{ transformOrigin: "17px 6px" }}
          transition={{ duration: 0.5, ease, delay: delay + 0.94 }}
        />
      </LazyMotion>
    </svg>
  );
}
