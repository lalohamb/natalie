"use client";

import { Play } from "lucide-react";
import { useState } from "react";
import { VideoPlayer } from "@/components/media/video-player";
import { YouTubePlayer } from "@/components/media/youtube-player";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import type { CuratedVideo } from "@/content/types";

function EmbedPlayer({ video, facebookUrl }: { video: CuratedVideo; facebookUrl: string }) {
  const [active, setActive] = useState(false);
  const embedSrc = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
    facebookUrl,
  )}&show_text=false&width=734&appId`;

  return (
    <div className="relative aspect-video w-full overflow-hidden">
      {active ? (
        <iframe
          src={embedSrc}
          title={video.title}
          className="h-full w-full border-0"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <EditorialPoster video={video} onPlay={() => setActive(true)} />
      )}
    </div>
  );
}

function EditorialPoster({
  video,
  onPlay,
  href,
}: {
  video: CuratedVideo;
  onPlay?: () => void;
  href?: string;
}) {
  const inner = (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-5 px-8 text-center">
      <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-espresso via-espresso to-forest" />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_60%,rgba(154,122,46,0.18),transparent)]" />
      <span aria-hidden className="absolute top-4 left-4 h-8 w-8 border-t border-l border-gold/50" />
      <span aria-hidden className="absolute right-4 bottom-4 h-8 w-8 border-r border-b border-gold/50" />

      <div className="relative flex flex-col items-center gap-4">
        <span aria-hidden className="block h-px w-10 bg-gold" />
        <span className="flex size-16 items-center justify-center rounded-full border border-ivory/30 bg-ivory/5 transition-colors duration-300 group-hover:border-ivory/70 group-hover:bg-ivory/10">
          <Play aria-hidden className="size-7 translate-x-0.5 fill-ivory" strokeWidth={0} />
        </span>
        <p className="font-display text-xl font-medium italic text-ivory text-balance leading-snug max-w-xs">
          {video.title}
        </p>
        <span className="font-sans text-eyebrow font-semibold text-gold-light uppercase tracking-[0.22em]">
          {href ? "Watch on Facebook ↗" : "Play message"}
        </span>
      </div>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group absolute inset-0"
        aria-label={`Watch "${video.title}" on Facebook (opens in a new tab)`}
      >
        {inner}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }

  return (
    <button type="button" onClick={onPlay} className="group absolute inset-0" aria-label={`Play: ${video.title}`}>
      {inner}
    </button>
  );
}

function LinkCard({ video, facebookUrl }: { video: CuratedVideo; facebookUrl: string }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden">
      <EditorialPoster video={video} href={facebookUrl} />
    </div>
  );
}

function FeaturedPlayer({ video }: { video: CuratedVideo }) {
  if (video.localSrc) {
    return <VideoPlayer src={video.localSrc} poster={video.posterSrc} title={video.title} />;
  }
  if (video.youtubeId) return <YouTubePlayer videoId={video.youtubeId} title={video.title} />;
  if (!video.facebookUrl) return null;
  return video.embeddable ? (
    <EmbedPlayer video={video} facebookUrl={video.facebookUrl} />
  ) : (
    <LinkCard video={video} facebookUrl={video.facebookUrl} />
  );
}

type FeaturedMessageProps = { video: CuratedVideo; eyebrow: string; heading: string };

export function FeaturedMessage({ video, eyebrow, heading }: FeaturedMessageProps) {
  return (
    <section aria-labelledby="featured-message-heading" className="py-16 bg-ivory lg:py-20">
      <Container>
        <Reveal className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left — media poster */}
          <div className="w-full">
            <FeaturedPlayer video={video} />
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
              {video.facebookUrl && !video.localSrc && !video.youtubeId && (
                <ButtonLink href={video.facebookUrl}>
                  Watch on Facebook
                </ButtonLink>
              )}
              <ButtonLink href="/media" variant={video.localSrc || video.youtubeId ? "primary" : "secondary"}>
                All Messages
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
