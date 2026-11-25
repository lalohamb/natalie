"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

type Phase = "cross" | "rotate" | "settle";

interface Particle {
  a: number; b: number; angle: number; speed: number;
  tilt: number; r: number; opacity: number; pulse: number;
}

const SIZE           = 320;
const PARTICLE_COUNT = 22;
const GOLD           = "212, 180, 106";
const CROSS_DURATION = 2000;
const ROTATE_DURATION = 2800;

function makeParticle(i: number, size: number): Particle {
  return {
    a:       size * 0.52 + Math.random() * size * 0.14,
    b:       size * 0.28 + Math.random() * size * 0.14,
    angle:   (i / PARTICLE_COUNT) * Math.PI * 2,
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
  cx: number, cy: number,
  globalAlpha: number,
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  for (const p of particles) {
    p.angle += p.speed;
    p.pulse += 0.018;
    const ex = p.a * Math.cos(p.angle);
    const ey = p.b * Math.sin(p.angle);
    const x  = cx + ex * Math.cos(p.tilt) - ey * Math.sin(p.tilt);
    const y  = cy + ex * Math.sin(p.tilt) + ey * Math.cos(p.tilt);
    const alpha = globalAlpha * p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));

    const grd = ctx.createRadialGradient(x, y, 0, x, y, p.r * 3.5);
    grd.addColorStop(0, `rgba(${GOLD}, ${alpha})`);
    grd.addColorStop(1, `rgba(${GOLD}, 0)`);
    ctx.beginPath();
    ctx.arc(x, y, p.r * 3.5, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${GOLD}, ${Math.min(1, alpha * 1.6)})`;
    ctx.fill();
  }
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const getReducedMotion = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;

export function NfMedallion({ className, size = SIZE }: { className?: string; size?: number }) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const rafRef     = useRef<number>(0);
  const particles  = useRef<Particle[]>([]);
  const [phase, setPhase] = useState<Phase>("cross");

  // Read through useSyncExternalStore so the first client render matches the
  // server's (which can't know the preference) and hydration never mismatches;
  // the real value is applied immediately afterwards.
  const reduced = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false);

  // Always-current alpha ref — start at 1 so particles are visible immediately
  const alphaRef = useRef(1);

  // ── Canvas loop ────────────────────────────────────────────────────────────
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
      drawParticles(ctx!, particles.current, cx, cy, alphaRef.current);
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [reduced, size]);

  // ── Phase sequencer ────────────────────────────────────────────────────────
  useEffect(() => {
    // With reduced motion the finished medallion is rendered directly (see
    // `medallionStyle` / `crossVisible`), so the phase never needs to advance.
    if (reduced) return;

    const t1 = setTimeout(() => setPhase("rotate"), CROSS_DURATION);
    const t2 = setTimeout(() => setPhase("settle"), CROSS_DURATION + ROTATE_DURATION);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [reduced]);

  // ── Medallion style per phase ──────────────────────────────────────────────
  const base: React.CSSProperties = {
    width:              size,
    height:             size,
    backgroundImage:    "url('/NF_christian_entrance_sprite.png')",
    backgroundRepeat:   "no-repeat",
    backgroundSize:     `${size}px ${size * 24}px`,
    backgroundPosition: `0 -${size * 23}px`,
    borderRadius:       "50%",
    position:           "relative",
    zIndex:             2,
  };

  const medallionStyle: React.CSSProperties = reduced ? base
    : phase === "cross"  ? { ...base, opacity: 0, transform: "perspective(800px) rotateY(-90deg) scale(0.5)", transition: "none" }
    : phase === "rotate" ? { ...base, opacity: 1, transform: "perspective(800px) rotateY(0deg) scale(1)", transition: `opacity 800ms ease, transform ${ROTATE_DURATION}ms cubic-bezier(0.16,1,0.3,1)` }
    : { ...base, opacity: 1, transform: "perspective(600px) rotateY(0deg) scale(1)", animation: "nfShimmer 4s ease-in-out infinite" };

  const crossVisible = phase === "cross" && !reduced;

  return (
    <div
      role="img"
      aria-label="Natalie Flemons Ministries emblem"
      className={`relative inline-block ${className ?? ""}`.trim()}
      style={{ width: size, height: size, fontSize: 0 }}
    >
      {/* Orbiting particles */}
      <canvas
        ref={canvasRef}
        width={size * 2}
        height={size * 2}
        style={{
          position: "absolute", inset: "50%",
          transform: "translate(-50%, -50%)",
          width: size * 2, height: size * 2,
          pointerEvents: "none", zIndex: 1,
        }}
      />

      {/* Christian cross light reveal */}
      {crossVisible && (
        <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none" }}>
          <div style={{
            position: "absolute", left: "50%", top: "10%",
            transform: "translateX(-50%)",
            width: "6px", height: 0,
            background: `linear-gradient(to bottom, transparent, rgba(${GOLD},1) 20%, rgba(${GOLD},1) 80%, transparent)`,
            animation: `nfCrossV ${CROSS_DURATION}ms cubic-bezier(0.22,1,0.36,1) both`,
            boxShadow: `0 0 18px 8px rgba(${GOLD},0.7)`,
          }} />
          <div style={{
            position: "absolute", left: "50%", top: "30%",
            transform: "translate(-50%, -50%)",
            width: 0, height: "6px",
            background: `linear-gradient(to right, transparent, rgba(${GOLD},1) 20%, rgba(${GOLD},1) 80%, transparent)`,
            animation: `nfCrossH ${CROSS_DURATION}ms cubic-bezier(0.22,1,0.36,1) both`,
            boxShadow: `0 0 18px 8px rgba(${GOLD},0.7)`,
          }} />
          <div style={{
            position: "absolute", left: "50%", top: "50%",
            transform: "translate(-50%, -50%)",
            width: 0, height: 0, borderRadius: "50%",
            background: `radial-gradient(circle, rgba(${GOLD},0.8) 0%, transparent 70%)`,
            animation: `nfBurst ${CROSS_DURATION}ms cubic-bezier(0.22,1,0.36,1) both`,
          }} />
        </div>
      )}

      {/* Medallion disc */}
      <div style={medallionStyle} />

      <style>{`
        @keyframes nfCrossV {
          0%   { height: 0; opacity: 0; }
          20%  { opacity: 1; }
          75%  { opacity: 0.8; }
          100% { height: ${size * 0.9}px; opacity: 0; }
        }
        @keyframes nfCrossH {
          0%   { width: 0; opacity: 0; }
          20%  { opacity: 1; }
          75%  { opacity: 0.8; }
          100% { width: ${size * 0.75}px; opacity: 0; }
        }
        @keyframes nfBurst {
          0%   { width: 0; height: 0; opacity: 0; }
          30%  { opacity: 0.9; }
          70%  { opacity: 0.6; }
          100% { width: ${size * 1.2}px; height: ${size * 1.2}px; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
