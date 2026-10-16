"use client";

import { m, LazyMotion, domAnimation } from "motion/react";

/**
 * EQUIP — Open Book
 * Meaning: spiritual discernment, learning, maturity.
 * Strokes draw in sequentially once the parent pillar enters the viewport.
 * Purely decorative — hidden from assistive technology.
 */
export function EquipSymbol({
  inView,
  delay = 0,
}: {
  inView: boolean;
  delay?: number;
}) {
  const ease = [0.22, 1, 0.36, 1] as const;
  const dur = 0.7;

  // Shared stroke props
  const stroke = {
    stroke: "#d4b46a", // gold-light
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 64 48"
      className="w-14 h-auto"
      style={{ overflow: "visible" }}
    >
      <LazyMotion features={domAnimation} strict>
        {/* Left page */}
        <m.path
          d="M32 40 C32 40 18 36 8 38 L8 10 C18 8 32 12 32 12 Z"
          {...stroke}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={inView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: dur, ease, delay }}
        />
        {/* Right page */}
        <m.path
          d="M32 40 C32 40 46 36 56 38 L56 10 C46 8 32 12 32 12 Z"
          {...stroke}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={inView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: dur, ease, delay: delay + 0.12 }}
        />
        {/* Spine */}
        <m.line
          x1="32" y1="12" x2="32" y2="40"
          {...stroke}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={inView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 0.35, ease, delay: delay + 0.22 }}
        />
        {/* Left text lines */}
        <m.line x1="14" y1="20" x2="28" y2="18.5"
          {...stroke} strokeWidth={1} strokeOpacity={0.6}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={inView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 0.4, ease, delay: delay + 0.32 }}
        />
        <m.line x1="14" y1="25" x2="28" y2="23.5"
          {...stroke} strokeWidth={1} strokeOpacity={0.6}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={inView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 0.4, ease, delay: delay + 0.38 }}
        />
        {/* Right text lines */}
        <m.line x1="36" y1="18.5" x2="50" y2="20"
          {...stroke} strokeWidth={1} strokeOpacity={0.6}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={inView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 0.4, ease, delay: delay + 0.44 }}
        />
        <m.line x1="36" y1="23.5" x2="50" y2="25"
          {...stroke} strokeWidth={1} strokeOpacity={0.6}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={inView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 0.4, ease, delay: delay + 0.5 }}
        />
      </LazyMotion>
    </svg>
  );
}
