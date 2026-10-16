"use client";

import { m, LazyMotion, domAnimation } from "motion/react";

/**
 * ACTIVATE — Expanding Pathways
 * Meaning: purpose, movement, Kingdom assignment.
 * Central point appears first, then three paths extend outward progressively.
 * Purely decorative — hidden from assistive technology.
 */
export function ActivateSymbol({
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
      viewBox="0 0 56 56"
      className="w-12 h-auto"
      style={{ overflow: "visible" }}
    >
      <LazyMotion features={domAnimation} strict>
        {/* Central point */}
        <m.circle
          cx="28" cy="28" r="3"
          fill="#d4b46a"
          stroke="none"
          initial={{ scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          style={{ transformOrigin: "28px 28px" }}
          transition={{ duration: 0.3, ease, delay }}
        />

        {/* Path 1 — upper right */}
        <m.path
          d="M30 26 L44 14"
          {...stroke}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={inView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 0.55, ease, delay: delay + 0.22 }}
        />
        {/* Arrowhead 1 */}
        <m.path
          d="M44 14 L40 15 M44 14 L43 18"
          {...stroke} strokeWidth={1.25}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={inView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 0.25, ease, delay: delay + 0.72 }}
        />

        {/* Path 2 — right */}
        <m.path
          d="M31 28 L48 28"
          {...stroke}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={inView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 0.55, ease, delay: delay + 0.34 }}
        />
        {/* Arrowhead 2 */}
        <m.path
          d="M48 28 L44 25 M48 28 L44 31"
          {...stroke} strokeWidth={1.25}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={inView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 0.25, ease, delay: delay + 0.84 }}
        />

        {/* Path 3 — lower right */}
        <m.path
          d="M30 30 L44 42"
          {...stroke}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={inView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 0.55, ease, delay: delay + 0.46 }}
        />
        {/* Arrowhead 3 */}
        <m.path
          d="M44 42 L43 38 M44 42 L40 41"
          {...stroke} strokeWidth={1.25}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={inView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 0.25, ease, delay: delay + 0.96 }}
        />

        {/* Subtle radiating ring */}
        <m.circle
          cx="28" cy="28" r="8"
          stroke="#d4b46a" strokeWidth={0.75} strokeOpacity={0.35} fill="none"
          initial={{ scale: 0.4, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          style={{ transformOrigin: "28px 28px" }}
          transition={{ duration: 0.5, ease, delay: delay + 0.18 }}
        />
      </LazyMotion>
    </svg>
  );
}
