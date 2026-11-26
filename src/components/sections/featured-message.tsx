"use client";

import { Play, X } from "lucide-react";
import { useEffect, useState } from "react";
import { VideoPlayer } from "@/components/media/video-player";
import { YouTubePlayer } from "@/components/media/youtube-player";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import type { CuratedVideo } from "@/content/types";

/** Static final frame of the NF medallion sprite — no animation, no canvas. */
function NfEmblem({ size = 72 }: { size?: number }) {
  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        backgroundImage: "url('/NF_christian_entrance_sprite.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: `${size}px ${size * 24}px`,
        backgroundPosition: `0 -${size * 23}px`,
        borderRadius: "50%",
        flexShrink: 0,
      }}
    />
  );
}

function EditorialPoster({ video, onPlay }: { video: CuratedVideo; onPlay: () => void }) {
  return (
    <button
      type="button"
      onClick={onPlay}
      className="group relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden"
      aria-label={`Play: ${video.title}`}
    >
      <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-espresso via-espresso to-forest" />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_60%,rgba(154,122,46,0.18),transparent)]" />
      <span aria-hidden className="absolute top-4 left-4 h-8 w-8 border-t border-l border-gold/50" />
      <span aria-hidden className="absolute right-4 bottom-4 h-8 w-8 border-r border-b border-gold/50" />

      <div className="relative flex flex-col items-center gap-4">
        <NfEmblem size={72} />
        <span className="flex size-14 items-center justify-center rounded-full border border-ivory/30 bg-ivory/5 transition-colors duration-300 group-hover:border-ivory/70 group-hover:bg-ivory/10">
          <Play aria-hidden className="size-6 translate-x-0.5 fill-ivory" strokeWidth={0} />
        </span>
        <p className="max-w-xs text-balance font-display text-xl font-medium italic leading-snug text-ivory">
          {video.title}
        </p>
        <span className="font-sans text-eyebrow font-semibold uppercase tracking-[0.22em] text-gold-light">
          Play message
        </span>
      </div>
    </button>
  );
}

function ModalContent({ video }: { video: CuratedVideo }) {
  if (video.localSrc) {
    return <VideoPlayer src={video.localSrc} poster={video.posterSrc} title={video.title} autoPlay />;
  }
  if (video.youtubeId) {
    return <YouTubePlayer videoId={video.youtubeId} title={video.title} autoPlay />;
  }
  if (video.facebookUrl && video.embeddable) {
    const embedSrc = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(video.facebookUrl)}&show_text=false&width=734&autoplay=true&appId`;
    return (
      <iframe
        src={embedSrc}
        title={video.title}
        className="aspect-video w-full border-0"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  }
  // Non-embeddable Facebook — show poster + link inside the modal
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-6 bg-espresso px-8 text-center">
      <NfEmblem size={80} />
      <p className="max-w-xs text-balance font-display text-xl font-medium italic leading-snug text-ivory">
        {video.title}
      </p>
      {video.facebookUrl && (
        <a
          href={video.facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-sm border border-gold/60 px-6 py-3 font-sans text-sm font-semibold uppercase tracking-[0.18em] text-gold-light transition-colors hover:border-gold hover:text-gold"
        >
          Watch on Facebook ↗
        </a>
      )}
    </div>
  );
}

function VideoModal({ video, onClose }: { video: CuratedVideo; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal
      aria-label={video.title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close video"
          className="absolute -top-10 right-0 flex size-9 items-center justify-center rounded-full border border-ivory/30 text-ivory transition-colors hover:border-ivory hover:bg-ivory/10"
        >
          <X aria-hidden className="size-4" strokeWidth={1.75} />
        </button>
        <ModalContent video={video} />
      </div>
    </div>
  );
}

type FeaturedMessageProps = { video: CuratedVideo; eyebrow: string; heading: string };

export function FeaturedMessage({ video, eyebrow, heading }: FeaturedMessageProps) {
  const [open, setOpen] = useState(false);

  return (
    <section aria-labelledby="featured-message-heading" className="bg-ivory py-16 lg:py-20">
      <Container>
        <Reveal className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left — poster (always shown; click opens modal) */}
          <div className="w-full">
            <EditorialPoster video={video} onPlay={() => setOpen(true)} />
          </div>

          {/* Right — text + CTA */}
          <div>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h2
              id="featured-message-heading"
              className="mt-6 font-display text-display-lg font-medium text-balance"
            >
              {heading}
            </h2>
            {video.description && (
              <p className="mt-5 text-pretty text-stone">{video.description}</p>
            )}
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink href="/media">All Messages</ButtonLink>
            </div>
          </div>
        </Reveal>
      </Container>

      {open && <VideoModal video={video} onClose={() => setOpen(false)} />}
    </section>
  );
}
