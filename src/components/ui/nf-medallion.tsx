"use client";

import { useEffect, useRef, useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Phase = "cross" | "rotate" | "settle";

interface Particle {
  /** Orbit semi-major axis (px) */
  a: number;
  /** Orbit semi-minor axis (px) */
  b: number;
  /** Current angle in orbit (radians) */
  angle: number;
  /** Angular speed (radians/frame) — randomised */
  speed: number;
  /** Orbit tilt from horizontal (radians) */
  tilt: number;
  /** Particle radius (px) */
  r: number;
  /** Base opacity */
  opacity: number;
  /** Phase offset for opacity pulse */
  pulse: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const SIZE = 320;          // medallion px
const PARTICLE_COUNT = 22;
const GOLD = "212, 180, 106"; // rgb — matches --color-gold-light

// Phase durations (ms)
const CROSS_DURATION  = 900;
const ROTATE_DURATION = 1400;
// settle is indefinite

// ─── Particle helpers ─────────────────────────────────────────────────────────

function makeParticle(i: number, size: number): Particle {
  const seed = i / PARTICLE_COUNT;
  return {
    a:       size * 0.52 + Math.random() * size * 0.14,
    b:       size * 0.28 + Math.random() * size * 0.14,
    angle:   seed * Math.PI * 2,
    speed:   (0.004 + Math.random() * 0.006) * (Math.random() < 0.5 ? 1 : -1),
    tilt:    Math.random() * Math.PI,
    r:       1.2 + Math.random() * 2.2,
    opacity: 0.35 + Math.random() * 0.55,
    pulse:   Math.random() * Math.PI * 2,
  };
}

function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  cx: number,
  cy: number,
  globalAlpha: number,
  frame: number,
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  for (const p of particles) {
    p.angle += p.speed;
    p.pulse += 0.018;

    // Elliptical orbit with tilt
    const ex = p.a * Math.cos(p.angle);
    const ey = p.b * Math.sin(p.angle);
    const x  = cx + ex * Math.cos(p.tilt) - ey * Math.sin(p.tilt);
    const y  = cy + ex * Math.sin(p.tilt) + ey * Math.cos(p.tilt);

    const alpha = globalAlpha * p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));

    // Glow
    const grd = ctx.createRadialGradient(x, y, 0, x, y, p.r * 3.5);
    grd.addColorStop(0,   `rgba(${GOLD}, ${alpha})`);
    grd.addColorStop(1,   `rgba(${GOLD}, 0)`);
    ctx.beginPath();
    ctx.arc(x, y, p.r * 3.5, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();

    // Core dot
    ctx.beginPath();
    ctx.arc(x, y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${GOLD}, ${Math.min(1, alpha * 1.6)})`;
    ctx.fill();
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function NfMedallion({ className, size = SIZE }: { className?: string; size?: number }) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const rafRef      = useRef<number>(0);
  const frameRef    = useRef<number>(0);
  const particles   = useRef<Particle[]>([]);
  const [phase, setPhase]               = useState<Phase>("cross");
  const [particleAlpha, setParticleAlpha] = useState(0);

  // Reduced-motion preference
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── Particle canvas loop ──────────────────────────────────────────────────
  useEffect(() => {
    if (reduced) return;
    particles.current = Array.from({ length: PARTICLE_COUNT }, (_, i) => makeParticle(i, size));

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cx = canvas.width  / 2;
    const cy = canvas.height / 2;

    function loop() {
      frameRef.current++;
      drawParticles(ctx!, particles.current, cx, cy, particleAlphaRef.current, frameRef.current);
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  // We need a ref for particleAlpha so the canvas loop always reads the latest value
  const particleAlphaRef = useRef(0);
  useEffect(() => {
    particleAlphaRef.current = particleAlpha;
  }, [particleAlpha]);

  // ── Phase sequencer ───────────────────────────────────────────────────────
  useEffect(() => {
    if (reduced) {
      setPhase("settle");
      setParticleAlpha(1);
      return;
    }

    // cross → rotate
    const t1 = setTimeout(() => {
      setPhase("rotate");
      // Fade particles in during rotation
      setParticleAlpha(0.3);
    }, CROSS_DURATION);

    // rotate → settle
    const t2 = setTimeout(() => {
      setPhase("settle");
      setParticleAlpha(1);
    }, CROSS_DURATION + ROTATE_DURATION);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [reduced]);

  // ── Derived CSS ───────────────────────────────────────────────────────────

  // Medallion 3D transform per phase
  const medallionStyle: React.CSSProperties = (() => {
    const base: React.CSSProperties = {
      width:  SIZE,
      height: SIZE,
      backgroundImage:    "url('/NF_christian_entrance_sprite.png')",
      backgroundRepeat:   "no-repeat",
      backgroundSize:     `${SIZE}px 7680px`,
      backgroundPosition: "0 -7360px", // always show final frame
      borderRadius:       "50%",
      position:           "relative",
      zIndex:             2,
    };

    if (reduced) return base;

    if (phase === "cross") {
      return {
        ...base,
        opacity:   0,
        transform: "perspective(600px) rotateY(-180deg) scale(0.6)",
        transition: "none",
      };
    }
    if (phase === "rotate") {
      return {
        ...base,
        opacity:   1,
        transform: "perspective(600px) rotateY(0deg) scale(1)",
        transition: `opacity 300ms ease, transform ${ROTATE_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1)`,
      };
    }
    // settle — stationary with gold shimmer
    return {
      ...base,
      opacity:   1,
      transform: "perspective(600px) rotateY(0deg) scale(1)",
      animation: "nfShimmer 4s ease-in-out infinite",
    };
  })();

  // Cross arms: 4 divs that expand from center
  const crossVisible = phase === "cross" && !reduced;

  return (
    <div
      role="img"
      aria-label="Natalie Flemons Ministries emblem"
      className={`relative inline-block ${className ?? ""}`.trim()}
      style={{ width: size, height: size, fontSize: 0 }}
    >
      {/* ── Canvas — orbiting particles ── */}
      <canvas
        ref={canvasRef}
        width={size * 2}
        height={size * 2}
        style={{
          position:  "absolute",
          inset:     "50%",
          transform: "translate(-50%, -50%)",
          width:     size * 2,
          height:    size * 2,
          pointerEvents: "none",
          zIndex:    1,
        }}
      />

      {/* ── Cross-light reveal ── */}
      {crossVisible && (
        <div
          aria-hidden
          style={{
            position:  "absolute",
            inset:     0,
            zIndex:    3,
            pointerEvents: "none",
          }}
        >
          {/* Vertical arm */}
          <div style={{
            position:        "absolute",
            left:            "50%",
            top:             "50%",
            transform:       "translate(-50%, -50%)",
            width:           "2px",
            height:          0,
            background:      `linear-gradient(to bottom, transparent, rgba(${GOLD},0.9), transparent)`,
            animation:       `nfCrossV ${CROSS_DURATION}ms cubic-bezier(0.22,1,0.36,1) both`,
            boxShadow:       `0 0 12px 4px rgba(${GOLD},0.5)`,
          }} />
          {/* Horizontal arm */}
          <div style={{
            position:        "absolute",
            left:            "50%",
            top:             "50%",
            transform:       "translate(-50%, -50%)",
            width:           0,
            height:          "2px",
            background:      `linear-gradient(to right, transparent, rgba(${GOLD},0.9), transparent)`,
            animation:       `nfCrossH ${CROSS_DURATION}ms cubic-bezier(0.22,1,0.36,1) both`,
            boxShadow:       `0 0 12px 4px rgba(${GOLD},0.5)`,
          }} />
          {/* Center burst */}
          <div style={{
            position:        "absolute",
            left:            "50%",
            top:             "50%",
            transform:       "translate(-50%, -50%)",
            width:           0,
            height:          0,
            borderRadius:    "50%",
            background:      `radial-gradient(circle, rgba(${GOLD},0.8) 0%, transparent 70%)`,
            animation:       `nfBurst ${CROSS_DURATION}ms cubic-bezier(0.22,1,0.36,1) both`,
          }} />
        </div>
      )}

      {/* ── Medallion disc ── */}
      <div style={{
        ...medallionStyle,
        width:  size,
        height: size,
        backgroundSize: `${size}px ${size * 24}px`,
        backgroundPosition: phase === "cross" && !reduced ? "0 0" : `0 -${size * 23}px`,
      }} />

      {/* ── Keyframes injected once ── */}
      <style>{`
        @keyframes nfCrossV {
          from { height: 0; opacity: 0; }
          40%  { opacity: 1; }
          to   { height: ${size}px; opacity: 0; }
        }
        @keyframes nfCrossH {
          from { width: 0; opacity: 0; }
          40%  { opacity: 1; }
          to   { width: ${size}px; opacity: 0; }
        }
        @keyframes nfBurst {
          from { width: 0; height: 0; opacity: 0; }
          50%  { opacity: 1; }
          to   { width: ${size * 0.8}px; height: ${size * 0.8}px; opacity: 0; }
        }
        @keyframes nfSpin {
          0%   { transform: perspective(600px) rotateY(0deg); }
          100% { transform: perspective(600px) rotateY(360deg); }
        }
      `}</style>
    </div>
  );
}
