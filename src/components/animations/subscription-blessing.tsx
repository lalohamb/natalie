"use client";

import { useId, useState } from "react";
import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

/**
 * SUBSCRIPTION BLESSING — shown once a newsletter subscription is confirmed.
 *
 * Sequence: light breaks open behind a cross that draws itself in gold, halo
 * rings pulse outward, a dove carrying an olive sprig flies in and settles
 * beside the cross, and sparks of light drift while the confirmation message
 * and a benediction rise into view.
 *
 * The artwork is decorative (hidden from assistive technology); the message is
 * announced through `role="status"`. With `prefers-reduced-motion` the finished
 * scene is shown immediately, with no movement.
 *
 * Designed for dark backgrounds (espresso / forest).
 */

const GOLD = "#d4b46a";
const IVORY = "#faf6ef";
const ESPRESSO = "#2a211c";
const EASE = [0.22, 1, 0.36, 1] as const;

// Centre of the cross — light radiates from here.
const CX = 160;
const CY = 75;

const round = (n: number) => Math.round(n * 100) / 100;

/** 24 tapered rays, alternating long and short. */
const RAYS = Array.from({ length: 24 }, (_, i) => {
  const angle = ((i * 15 - 90) * Math.PI) / 180;
  const long = i % 2 === 0;
  const inner = 20;
  const outer = long ? 150 : 104;
  const spread = long ? 0.034 : 0.022;
  const point = (r: number, a: number) => `${round(CX + r * Math.cos(a))},${round(CY + r * Math.sin(a))}`;
  return {
    points: `${point(inner, angle)} ${point(outer, angle - spread)} ${point(outer, angle + spread)}`,
    opacity: long ? 0.9 : 0.55,
  };
});

/** Fixed positions so the scene is identical on every render. */
const SPARKS = [
  { x: 52, y: 34, size: 1, delay: 1.3 },
  { x: 92, y: 120, size: 0.7, delay: 2.1 },
  { x: 118, y: 22, size: 0.6, delay: 1.7 },
  { x: 34, y: 96, size: 0.8, delay: 2.6 },
  { x: 74, y: 70, size: 0.5, delay: 3.0 },
  { x: 204, y: 128, size: 0.8, delay: 1.5 },
  { x: 236, y: 92, size: 0.6, delay: 2.4 },
  { x: 282, y: 60, size: 1, delay: 1.9 },
  { x: 262, y: 142, size: 0.7, delay: 2.9 },
  { x: 298, y: 112, size: 0.5, delay: 1.4 },
  { x: 132, y: 158, size: 0.6, delay: 2.2 },
  { x: 190, y: 166, size: 0.5, delay: 3.2 },
] as const;

const SPARK_PATH =
  "M0 -6 C0.6 -1.6 1.6 -0.6 6 0 C1.6 0.6 0.6 1.6 0 6 C-0.6 1.6 -1.6 0.6 -6 0 C-1.6 -0.6 -0.6 -1.6 0 -6 Z";

const CROSS_PATH = "M155 38 h10 v32 h26 v10 h-26 v82 h-10 v-82 h-26 v-10 h26 z";

export function SubscriptionBlessing({ message, className }: { message: string; className?: string }) {
  const still = useReducedMotion() ?? false;
  const [settled, setSettled] = useState(false);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const ids = {
    glow: `nfb-glow-${uid}`,
    ray: `nfb-ray-${uid}`,
    cross: `nfb-cross-${uid}`,
    blur: `nfb-blur-${uid}`,
  };

  /** Entrance helper: animate from → to, or jump straight to `to` when motion is reduced. */
  const enter = <T extends Record<string, unknown>>(from: T, to: T, duration: number, delay: number) =>
    still
      ? { initial: false as const, animate: to }
      : { initial: from, animate: to, transition: { duration, delay, ease: EASE } };

  // Wings beat quickly in flight, then slow to a gentle hover once the dove settles.
  const flap = (phase: number) =>
    still
      ? {}
      : {
          animate: { scaleY: settled ? [1, 0.35, 1] : [1, -0.5, 1] },
          transition: {
            duration: settled ? 1.5 : 0.42,
            delay: phase,
            repeat: Infinity,
            ease: "easeInOut" as const,
          },
        };

  return (
    <div className={cn("flex flex-col items-center text-center", className)}>
      <LazyMotion features={domAnimation} strict>
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 320 190"
          className="h-auto w-full max-w-sm"
          style={{ overflow: "visible" }}
        >
          <defs>
            <radialGradient id={ids.glow} gradientUnits="userSpaceOnUse" cx={CX} cy={CY} r="120">
              <stop offset="0" stopColor="#fff3cf" stopOpacity="0.6" />
              <stop offset="0.35" stopColor={GOLD} stopOpacity="0.28" />
              <stop offset="1" stopColor={GOLD} stopOpacity="0" />
            </radialGradient>
            <radialGradient id={ids.ray} gradientUnits="userSpaceOnUse" cx={CX} cy={CY} r="150">
              <stop offset="0.1" stopColor="#ffe9ad" stopOpacity="0.6" />
              <stop offset="0.55" stopColor={GOLD} stopOpacity="0.22" />
              <stop offset="1" stopColor={GOLD} stopOpacity="0" />
            </radialGradient>
            <linearGradient id={ids.cross} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff1c9" />
              <stop offset="0.5" stopColor={GOLD} />
              <stop offset="1" stopColor="#a8873d" />
            </linearGradient>
            <filter id={ids.blur} x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>

          {/* 1. Light breaks open */}
          <m.circle
            cx={CX}
            cy={CY}
            r="120"
            fill={`url(#${ids.glow})`}
            {...enter({ opacity: 0, scale: 0.2 }, { opacity: 1, scale: 1 }, 1.4, 0)}
          />

          {/* 2. Rays — slow rotation (outer), bloom + breathing (inner) */}
          <m.g
            animate={still ? undefined : { rotate: 360 }}
            transition={still ? undefined : { duration: 120, repeat: Infinity, ease: "linear" }}
          >
            <m.g {...enter({ scale: 0.25, opacity: 0 }, { scale: 1, opacity: 1 }, 1.6, 0.15)}>
              <m.g
                animate={still ? undefined : { opacity: [1, 0.6, 1] }}
                transition={still ? undefined : { duration: 5, delay: 1.8, repeat: Infinity, ease: "easeInOut" }}
              >
                {RAYS.map((ray, i) => (
                  <polygon key={i} points={ray.points} fill={`url(#${ids.ray})`} opacity={ray.opacity} />
                ))}
              </m.g>
            </m.g>
          </m.g>

          {/* 3. Halo rings pulse outward */}
          {!still &&
            [0.2, 0.9, 1.6].map((delay) => (
              <m.circle
                key={delay}
                cx={CX}
                cy={CY}
                r="26"
                fill="none"
                stroke={GOLD}
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: [0.4, 4.6], opacity: [0.75, 0] }}
                transition={{ duration: 3.2, delay, repeat: Infinity, repeatDelay: 1.6, ease: "easeOut" }}
              />
            ))}

          {/* 4. The cross — soft bloom, outline drawn in gold, then filled */}
          <m.path
            d={CROSS_PATH}
            fill="#ffe9ad"
            filter={`url(#${ids.blur})`}
            {...enter({ opacity: 0 }, { opacity: 0.55 }, 1.2, 1.5)}
          />
          <m.path
            d={CROSS_PATH}
            fill={`url(#${ids.cross})`}
            {...enter({ opacity: 0 }, { opacity: 1 }, 0.9, 1.5)}
          />
          <m.path
            d={CROSS_PATH}
            fill="none"
            stroke="#fff1c9"
            strokeWidth="1.25"
            strokeLinejoin="round"
            {...enter({ pathLength: 0, opacity: 0 }, { pathLength: 1, opacity: 1 }, 1.5, 0.45)}
          />

          {/* 5. Sparks of light */}
          {SPARKS.map((spark) => (
            <g key={`${spark.x}-${spark.y}`} transform={`translate(${spark.x} ${spark.y})`}>
              {still ? (
                <path d={SPARK_PATH} fill={GOLD} opacity={0.7} transform={`scale(${spark.size * 0.8})`} />
              ) : (
                <m.path
                  d={SPARK_PATH}
                  fill={GOLD}
                  initial={{ scale: 0, opacity: 0, rotate: 0, y: 4 }}
                  animate={{
                    scale: [0, spark.size, 0],
                    opacity: [0, 1, 0],
                    rotate: [0, 45, 90],
                    y: [4, 0, -8],
                  }}
                  transition={{
                    duration: 2.4,
                    delay: spark.delay,
                    repeat: Infinity,
                    repeatDelay: 1.2 + spark.size,
                    ease: "easeInOut",
                  }}
                />
              )}
            </g>
          ))}

          {/* 6. The dove — flies in on an arc and settles beside the cross */}
          <m.g
            initial={still ? false : { x: -40, y: 150, rotate: -24, opacity: 0, scale: 0.7 }}
            animate={
              still
                ? { x: 206, y: 20, rotate: 0, opacity: 1, scale: 1 }
                : {
                    x: [-40, 70, 168, 206],
                    y: [150, 66, 4, 20],
                    rotate: [-24, -16, 8, 0],
                    opacity: [0, 1, 1, 1],
                    scale: [0.7, 0.9, 1, 1],
                  }
            }
            transition={still ? undefined : { duration: 2.6, delay: 0.9, times: [0, 0.4, 0.8, 1], ease: "easeInOut" }}
            onAnimationComplete={() => setSettled(true)}
          >
            {/* Gentle hover once settled */}
            <m.g
              animate={!still && settled ? { y: [0, -4, 0] } : undefined}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Far wing */}
              <m.path
                key={settled ? "far-hover" : "far-flight"}
                d="M28 24 C30 12 40 4 52 0 C49 9 46 18 42 24 Z"
                fill={IVORY}
                opacity={0.72}
                style={{ originX: 0.3, originY: 1 }}
                {...flap(0.08)}
              />
              {/* Tail */}
              <path d="M12 33 L-5 37 L1 30 L-4 22 L11 28 Z" fill={IVORY} />
              {/* Body, head and beak */}
              <path
                d="M6 30 C14 22 30 20 42 24 C48 19 54 19 57 23 L64 26 L57 28 C55 34 46 38 36 38 C26 38 16 36 6 30 Z"
                fill={IVORY}
              />
              <circle cx="54" cy="24.4" r="1" fill={ESPRESSO} />
              {/* Olive sprig */}
              <path d="M62 26.5 C66 29 69 32 71 36" fill="none" stroke={GOLD} strokeWidth="1" strokeLinecap="round" />
              <path d="M66 29 C69 26 73 27 74 29 C71 31 68 31 66 29 Z" fill={GOLD} />
              <path d="M68.5 32 C66 34 63 34 62 32.5 C64 30.5 67 30.5 68.5 32 Z" fill={GOLD} />
              <path d="M71 36 C74 34 77 36 77 38 C74 39.5 72 38.5 71 36 Z" fill={GOLD} />
              {/* Near wing */}
              <m.path
                key={settled ? "near-hover" : "near-flight"}
                d="M24 25 C22 10 32 -2 46 -8 C45 4 42 16 39 25 Z"
                fill={IVORY}
                style={{ originX: 0.3, originY: 1 }}
                {...flap(0)}
              />
            </m.g>
          </m.g>
        </svg>

        <m.p
          role="status"
          className="mt-6 max-w-sm font-display text-xl leading-snug text-balance text-ivory italic"
          {...enter({ opacity: 0, y: 12 }, { opacity: 1, y: 0 }, 0.8, 1.2)}
        >
          {message}
        </m.p>

        <m.div className="mt-5 flex flex-col items-center" {...enter({ opacity: 0, y: 10 }, { opacity: 1, y: 0 }, 0.9, 2.4)}>
          <span aria-hidden className="block h-px w-10 bg-gold-light/60" />
          <blockquote className="mt-4 max-w-xs font-display text-base leading-relaxed text-mist italic">
            &ldquo;The Lord bless thee, and keep thee: the Lord make his face shine upon thee, and be gracious unto
            thee.&rdquo;
          </blockquote>
          <p className="mt-2 font-sans text-[0.7rem] font-semibold tracking-[0.18em] text-gold-light uppercase">
            Numbers 6:24&ndash;25
          </p>
        </m.div>
      </LazyMotion>
    </div>
  );
}
