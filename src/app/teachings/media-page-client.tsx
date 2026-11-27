"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { VideoPlayer } from "@/components/media/video-player";
import { YouTubePlayer } from "@/components/media/youtube-player";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SectionHeading } from "@/components/ui/section-heading";
import type { CuratedVideo, VideoCategory } from "@/content/types";
import { cn } from "@/lib/cn";

// ---------------------------------------------------------------------------
// Static data — imported directly because this is a client component.
// The accessor boundary is maintained: this file imports from lib/content
// via a server wrapper below, but for the client component we pass data as props.
// ---------------------------------------------------------------------------

const CATEGORY_LABELS: Record<VideoCategory | "all", string> = {
  all: "All",
  "ministry-message": "Ministry Messages",
  "biblical-teaching": "Biblical Teachings",
  interview: "Interviews",
  "personal-reflection": "Personal Reflections",
  "event-highlight": "Event Highlights",
};

// ---------------------------------------------------------------------------
// Individual video card
// ---------------------------------------------------------------------------
function VideoCard({ video }: { video: CuratedVideo }) {
  const [active, setActive] = useState(false);

  const embedSrc = video.facebookUrl
    ? `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(video.facebookUrl)}&show_text=false&width=560&appId`
    : null;

  return (
    <article aria-labelledby={`video-${video.id}`} className="flex flex-col gap-4">
      {/* Player area */}
      <div className="relative aspect-video w-full overflow-hidden">
        {video.localSrc ? (
          <VideoPlayer src={video.localSrc} poster={video.posterSrc} title={video.title} />
        ) : video.youtubeId ? (
          <YouTubePlayer videoId={video.youtubeId} title={video.title} />
        ) : video.embeddable && active && embedSrc ? (
          <iframe
            src={embedSrc}
            title={video.title}
            className="h-full w-full border-0"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <a
            href={video.facebookUrl ?? "#"}
            target={video.embeddable ? undefined : "_blank"}
            rel={video.embeddable ? undefined : "noopener noreferrer"}
            onClick={
              video.embeddable
                ? (e) => { e.preventDefault(); setActive(true); }
                : undefined
            }
            className="group absolute inset-0 flex flex-col items-center justify-center gap-3"
            aria-label={
              video.embeddable
                ? `Play: ${video.title}`
                : `Watch "${video.title}" on Facebook (opens in a new tab)`
            }
          >
            {/* Editorial poster background */}
            <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-espresso via-espresso to-forest" />
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_60%,rgba(154,122,46,0.15),transparent)]" />
            <span aria-hidden className="absolute top-3 left-3 h-6 w-6 border-t border-l border-gold/40" />
            <span aria-hidden className="absolute right-3 bottom-3 h-6 w-6 border-r border-b border-gold/40" />

            {/* Content */}
            <div className="relative flex flex-col items-center gap-3 px-6 text-center">
              <span aria-hidden className="block h-px w-6 bg-gold/60" />
              <span className="flex size-12 items-center justify-center rounded-full border border-ivory/30 bg-ivory/5 transition-colors duration-300 group-hover:border-ivory/60 group-hover:bg-ivory/10">
                <Play aria-hidden className="size-5 translate-x-0.5 fill-ivory" strokeWidth={0} />
              </span>
              {!video.embeddable && (
                <span className="font-sans text-[0.65rem] font-semibold text-gold-light uppercase tracking-[0.18em]">
                  Watch on Facebook ↗
                </span>
              )}
            </div>
          </a>
        )}
      </div>

      {/* Metadata */}
      <div>
        <Eyebrow rule={false} className="text-[0.6875rem]">
          {CATEGORY_LABELS[video.category]}
        </Eyebrow>
        <h3
          id={`video-${video.id}`}
          className="mt-2 font-display text-display-sm font-medium text-balance"
        >
          {video.title}
        </h3>
        {video.description && (
          <p className="mt-2 text-sm text-pretty text-stone">{video.description}</p>
        )}
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Page — client component so category filter state works without a server round-trip
// ---------------------------------------------------------------------------
type MediaPageClientProps = { videos: CuratedVideo[] };

export function MediaPageClient({ videos }: MediaPageClientProps) {
  const [activeCategory, setActiveCategory] = useState<VideoCategory | "all">("all");

  const categories = (["all", ...new Set(videos.map((v) => v.category))] as (VideoCategory | "all")[]);

  const filtered = activeCategory === "all"
    ? videos
    : videos.filter((v) => v.category === activeCategory);

  return (
    <>
      {/* ── Header ── */}
      <section className="border-b border-sand bg-linen py-16">
        <Container>
          <SectionHeading
            as="h1"
            eyebrow="Media"
            title="Messages & Ministry"
            lede="Curated video messages, teachings, and appearances from Natalie C. Flemons."
            className="motion-safe:animate-rise"
          />
        </Container>
      </section>

      {/* ── Category filter ── */}
      {categories.length > 2 && (
        <div className="sticky top-20 z-30 border-b border-sand bg-ivory/95 backdrop-blur-sm">
          <Container>
            <ul className="flex gap-1 overflow-x-auto py-3 scrollbar-none" role="list">
              {categories.map((cat) => (
                <li key={cat} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      "rounded-sm px-4 py-2 font-sans text-[0.8125rem] font-semibold transition-colors",
                      activeCategory === cat
                        ? "bg-espresso text-ivory"
                        : "text-stone hover:bg-linen hover:text-espresso",
                    )}
                    aria-pressed={activeCategory === cat}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                </li>
              ))}
            </ul>
          </Container>
        </div>
      )}

      {/* ── Video grid ── */}
      <section aria-label="Videos" className="py-section">
        <Container>
          {videos.length === 0 ? (
            <Reveal>
              <div className="rounded-sm border border-sand bg-linen px-8 py-16 text-center">
                <p className="font-display text-display-sm font-medium text-espresso">
                  Videos coming soon.
                </p>
                <p className="mt-3 text-stone">
                  Ministry messages and teachings will be published here.
                </p>
              </div>
            </Reveal>
          ) : filtered.length === 0 ? (
            <p className="text-stone">No videos in this category yet.</p>
          ) : (
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {filtered
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((video, i) => (
                  <Reveal key={video.id} delay={Math.min(i * 0.06, 0.24)}>
                    <VideoCard video={video} />
                  </Reveal>
                ))}
            </div>
          )}
        </Container>
      </section>

    </>
  );
}
