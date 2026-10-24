"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { Play } from "lucide-react";
import { PLAY_EVENT } from "@/components/media/video-player";
import { youTubeEmbedUrl, youTubeThumbnail } from "@/lib/youtube";
import { cn } from "@/lib/cn";

type YouTubePlayerProps = {
  videoId: string;
  title: string;
  className?: string;
};

/**
 * Click-to-load YouTube embed. Shows the video thumbnail until the visitor
 * presses play, so no YouTube scripts or cookies load before then; the embed
 * uses youtube-nocookie.com. Joins the page's one-player-at-a-time behaviour.
 */
export function YouTubePlayer({ videoId, title, className }: YouTubePlayerProps) {
  const id = useId();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const onOtherPlay = (e: Event) => {
      if ((e as CustomEvent<string>).detail === id) return;
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func: "pauseVideo", args: [] }),
        "*",
      );
    };
    window.addEventListener(PLAY_EVENT, onOtherPlay);
    return () => window.removeEventListener(PLAY_EVENT, onOtherPlay);
  }, [id]);

  const play = () => {
    setActive(true);
    window.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: id }));
  };

  return (
    <div className={cn("relative aspect-video w-full overflow-hidden bg-black", className)}>
      {active ? (
        <iframe
          ref={iframeRef}
          src={youTubeEmbedUrl(videoId)}
          title={title}
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          onFocus={() => window.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: id }))}
        />
      ) : (
        <button
          type="button"
          onClick={play}
          aria-label={`Play ${title} (YouTube)`}
          className="group/play absolute inset-0 flex items-center justify-center"
        >
          <Image
            src={youTubeThumbnail(videoId)}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
          <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-espresso/70 via-espresso/10 to-transparent" />
          <span className="relative flex size-16 items-center justify-center rounded-full border border-ivory/40 bg-espresso/60 backdrop-blur-sm transition-colors duration-300 group-hover/play:border-gold-light group-hover/play:bg-espresso/80">
            <Play aria-hidden className="size-6 translate-x-0.5 fill-ivory" strokeWidth={0} />
          </span>
          <span className="absolute bottom-3 left-3 rounded-sm bg-espresso/70 px-2 py-1 font-sans text-[0.625rem] font-semibold tracking-[0.14em] text-ivory uppercase backdrop-blur-sm">
            YouTube
          </span>
        </button>
      )}
    </div>
  );
}
