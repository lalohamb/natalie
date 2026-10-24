"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  LoaderCircle,
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/cn";

/** Broadcast when a player starts so every other player on the page pauses. */
export const PLAY_EVENT = "nfm:video-play";
const SPEEDS = [1, 1.25, 1.5, 2, 0.75] as const;
const HIDE_CONTROLS_AFTER_MS = 2500;

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const s = Math.floor(seconds % 60);
  const m = Math.floor(seconds / 60) % 60;
  const h = Math.floor(seconds / 3600);
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}

type VideoPlayerProps = {
  src: string;
  title: string;
  poster?: string;
  className?: string;
};

/**
 * Self-hosted video player with branded, accessible controls: play/pause,
 * seek, elapsed/total time, mute + volume, playback speed and fullscreen.
 *
 * Keyboard (when the player has focus): Space/K play-pause, ←/→ seek 5s,
 * ↑/↓ volume, M mute, F fullscreen.
 */
export function VideoPlayer({ src, title, poster, className }: VideoPlayerProps) {
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  const video = () => videoRef.current;

  // ── Playback ──────────────────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused || v.ended) void v.play().catch(() => {});
    else v.pause();
  }, []);

  const seekBy = useCallback((delta: number) => {
    const v = videoRef.current;
    if (!v || !Number.isFinite(v.duration)) return;
    v.currentTime = Math.min(Math.max(v.currentTime + delta, 0), v.duration);
  }, []);

  const setVolumeLevel = useCallback((level: number) => {
    const v = videoRef.current;
    if (!v) return;
    const next = Math.min(Math.max(level, 0), 1);
    v.volume = next;
    v.muted = next === 0;
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    if (!v.muted && v.volume === 0) v.volume = 0.5;
  }, []);

  const cycleSpeed = () => {
    const v = video();
    if (!v) return;
    const next = (speedIndex + 1) % SPEEDS.length;
    v.playbackRate = SPEEDS[next];
    setSpeedIndex(next);
  };

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    const v = videoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (!el || !v) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else if (el.requestFullscreen) {
      void el.requestFullscreen().catch(() => {});
    } else {
      // iOS Safari only supports fullscreen on the <video> element itself.
      v.webkitEnterFullscreen?.();
    }
  }, []);

  // ── Controls auto-hide while playing ─────────────────────────────────────
  const revealControls = useCallback(() => {
    setControlsVisible(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setControlsVisible(false);
    }, HIDE_CONTROLS_AFTER_MS);
  }, []);

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  // ── One player at a time + fullscreen state ──────────────────────────────
  useEffect(() => {
    const onOtherPlay = (e: Event) => {
      if ((e as CustomEvent<string>).detail !== id) videoRef.current?.pause();
    };
    const onFullscreenChange = () =>
      setFullscreen(document.fullscreenElement === containerRef.current);
    window.addEventListener(PLAY_EVENT, onOtherPlay);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      window.removeEventListener(PLAY_EVENT, onOtherPlay);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, [id]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Let sliders and buttons keep their native keyboard behaviour.
    const target = e.target as HTMLElement;
    if (target !== containerRef.current && target !== videoRef.current) return;

    const handlers: Record<string, () => void> = {
      " ": togglePlay,
      k: togglePlay,
      ArrowLeft: () => seekBy(-5),
      ArrowRight: () => seekBy(5),
      ArrowUp: () => setVolumeLevel((videoRef.current?.volume ?? 1) + 0.1),
      ArrowDown: () => setVolumeLevel((videoRef.current?.volume ?? 1) - 0.1),
      m: toggleMute,
      f: toggleFullscreen,
    };
    const handler = handlers[e.key];
    if (handler) {
      e.preventDefault();
      handler();
      revealControls();
    }
  };

  const showControls = controlsVisible || !playing;
  const effectiveVolume = muted ? 0 : volume;
  const VolumeIcon = effectiveVolume === 0 ? VolumeX : effectiveVolume < 0.5 ? Volume1 : Volume2;
  const progress = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={`Video player: ${title}`}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerMove={revealControls}
      onPointerLeave={() => playing && setControlsVisible(false)}
      onFocus={revealControls}
      className={cn(
        "group/player relative aspect-video w-full overflow-hidden bg-black outline-none focus-visible:ring-2 focus-visible:ring-gold-light",
        fullscreen && "aspect-auto",
        !showControls && "cursor-none",
        className,
      )}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        preload="metadata"
        playsInline
        aria-label={title}
        className="h-full w-full object-contain"
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
        onPlay={(e) => {
          setPlaying(true);
          setDuration(e.currentTarget.duration);
          setStarted(true);
          setEnded(false);
          window.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: id }));
          revealControls();
        }}
        onPause={() => {
          setPlaying(false);
          setControlsVisible(true);
        }}
        onEnded={() => setEnded(true)}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onCanPlay={() => setBuffering(false)}
        onTimeUpdate={(e) => {
          setCurrent(e.currentTarget.currentTime);
          // Metadata often loads before hydration, so loadedmetadata can be missed.
          setDuration(e.currentTarget.duration);
        }}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onVolumeChange={(e) => {
          setVolume(e.currentTarget.volume);
          setMuted(e.currentTarget.muted);
        }}
      />

      {/* Centre play / replay button before start and after the end */}
      {(!started || ended) && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label={ended ? `Replay ${title}` : `Play ${title}`}
          className="group/play absolute inset-0 flex items-center justify-center bg-gradient-to-t from-espresso/60 via-espresso/10 to-transparent"
        >
          <span className="flex size-16 items-center justify-center rounded-full border border-ivory/40 bg-espresso/60 backdrop-blur-sm transition-colors duration-300 group-hover/play:border-gold-light group-hover/play:bg-espresso/80">
            {ended ? (
              <RotateCcw aria-hidden className="size-6 text-ivory" strokeWidth={1.75} />
            ) : (
              <Play aria-hidden className="size-6 translate-x-0.5 fill-ivory" strokeWidth={0} />
            )}
          </span>
        </button>
      )}

      {buffering && playing && (
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <LoaderCircle className="size-10 animate-spin text-ivory/80" strokeWidth={1.5} />
        </div>
      )}

      {/* Control bar */}
      {started && (
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-3 pt-8 pb-2 transition-opacity duration-300",
            showControls ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={current}
            onChange={(e) => {
              const v = video();
              if (v) v.currentTime = Number(e.target.value);
            }}
            aria-label="Seek"
            aria-valuetext={`${formatTime(current)} of ${formatTime(duration)}`}
            className="nfm-range block w-full"
            style={{ "--nfm-range-fill": `${progress}%` } as React.CSSProperties}
          />

          <div className="mt-1 flex items-center gap-1 text-ivory">
            <ControlButton label={playing ? "Pause" : "Play"} onClick={togglePlay}>
              {playing ? (
                <Pause aria-hidden className="size-5 fill-ivory" strokeWidth={0} />
              ) : (
                <Play aria-hidden className="size-5 fill-ivory" strokeWidth={0} />
              )}
            </ControlButton>

            <div className="group/volume flex items-center">
              <ControlButton label={muted || volume === 0 ? "Unmute" : "Mute"} onClick={toggleMute}>
                <VolumeIcon aria-hidden className="size-5" strokeWidth={1.75} />
              </ControlButton>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={effectiveVolume}
                onChange={(e) => setVolumeLevel(Number(e.target.value))}
                aria-label="Volume"
                aria-valuetext={`${Math.round(effectiveVolume * 100)}%`}
                className="nfm-range hidden w-20 sm:block"
                style={{ "--nfm-range-fill": `${effectiveVolume * 100}%` } as React.CSSProperties}
              />
            </div>

            <span className="ml-2 font-sans text-xs tabular-nums text-ivory/90">
              {formatTime(current)} <span className="text-ivory/50">/ {formatTime(duration)}</span>
            </span>

            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={cycleSpeed}
                aria-label={`Playback speed ${SPEEDS[speedIndex]}x`}
                className="min-h-10 min-w-12 rounded-sm px-2 font-sans text-xs font-semibold tabular-nums transition-colors hover:bg-ivory/15 focus-visible:outline-2 focus-visible:outline-gold-light"
              >
                {SPEEDS[speedIndex]}×
              </button>
              <ControlButton label={fullscreen ? "Exit full screen" : "Full screen"} onClick={toggleFullscreen}>
                {fullscreen ? (
                  <Minimize aria-hidden className="size-5" strokeWidth={1.75} />
                ) : (
                  <Maximize aria-hidden className="size-5" strokeWidth={1.75} />
                )}
              </ControlButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ControlButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex size-10 items-center justify-center rounded-sm transition-colors hover:bg-ivory/15 focus-visible:outline-2 focus-visible:outline-gold-light"
    >
      {children}
    </button>
  );
}
