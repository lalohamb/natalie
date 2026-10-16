"use client";

import { Play } from "lucide-react";
import { useState } from "react";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import type { CuratedVideo } from "@/content/types";

// ---------------------------------------------------------------------------
// Embeddable video player (user-initiated — no Facebook JS loads until click)
// ---------------------------------------------------------------------------
function EmbedPlayer({ video }: { video: CuratedVideo }) {
  const [active, setActive] = useState(false);

  // Build the oEmbed iframe src from the public video URL
  const embedSrc = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
    video.facebookUrl,
  )}&show_text=false&width=734&appId`;

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-espresso">
      {active ? (
        <iframe
          src={embedSrc}
          title={video.title}
          className="h-full w-full border-0"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          className="group absolute inset-0 flex flex-col items-center justify-center gap-4 bg-espresso text-ivory"
          aria-label={`Play: ${video.title}`}
        >
          <span className="flex size-16 items-center justify-center rounded-full border-2 border-ivory/60 transition-colors duration-300 group-hover:border-ivory group-hover:bg-ivory/10">
            <Play aria-hidden className="size-7 translate-x-0.5 fill-ivory" strokeWidth={0} />
          </span>
          <span className="font-display text-xl italic text-ivory/80 group-hover:text-ivory">
            {video.title}
          </span>
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Link card for non-embeddable URLs (Reels, restricted videos)
// ---------------------------------------------------------------------------
function LinkCard({ video }: { video: CuratedVideo }) {
  return (
    <a
      href={video.facebookUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex aspect-video w-full items-center justify-center overflow-hidden bg-espresso"
      aria-label={`Watch "${video.title}" on Facebook (opens in a new tab)`}
    >
      <div className="flex flex-col items-center gap-4 text-ivory">
        <span className="flex size-16 items-center justify-center rounded-full border-2 border-ivory/60 transition-colors duration-300 group-hover:border-ivory group-hover:bg-ivory/10">
          <Play aria-hidden className="size-7 translate-x-0.5 fill-ivory" strokeWidth={0} />
        </span>
        <span className="font-display text-xl italic text-ivory/80 group-hover:text-ivory">
          {video.title}
        </span>
        <span className="font-sans text-sm text-ivory/50 group-hover:text-ivory/70">
          Watch on Facebook ↗
        </span>
      </div>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------
type FeaturedMessageProps = {
  video: CuratedVideo;
  eyebrow: string;
  heading: string;
};

export function FeaturedMessage({ video, eyebrow, heading }: FeaturedMessageProps) {
  return (
    <section aria-labelledby="featured-message-heading" className="bg-linen py-section">
      <Container>
        <Reveal className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h2
              id="featured-message-heading"
              className="mt-6 font-display text-display-lg font-medium text-balance"
            >
              {heading}
            </h2>
          </div>
          <ButtonLink
            href="/media"
            variant="text"
            arrow
            className="shrink-0 self-start md:self-auto"
          >
            All messages
          </ButtonLink>
        </Reveal>

        <Reveal className="mt-12" delay={0.1}>
          <div className="mx-auto max-w-3xl">
            {/* Title above player */}
            <p className="mb-4 font-sans text-eyebrow font-semibold text-gold-ink uppercase tracking-[0.22em]">
              {video.title}
            </p>

            {/* Player or link card */}
            {video.embeddable ? (
              <EmbedPlayer video={video} />
            ) : (
              <LinkCard video={video} />
            )}

            {/* Description below player */}
            {video.description && (
              <p className="mt-5 text-pretty text-stone">{video.description}</p>
            )}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
