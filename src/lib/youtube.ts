/*
 * YouTube link helpers. Client-safe (no server imports) so the admin form can
 * preview a link as it's typed and the server can validate the same way.
 */

const ID = /^[A-Za-z0-9_-]{11}$/;
const HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"]);

/**
 * Extracts the 11-character video id from any common YouTube link:
 * watch?v=, youtu.be/, /shorts/, /live/, /embed/, /v/ — or a bare id.
 * Returns null for playlists, channels and anything else.
 */
export function parseYouTubeId(input: string): string | null {
  const value = input.trim();
  if (ID.test(value)) return value;

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase();
  if (host === "youtu.be") {
    const id = url.pathname.split("/")[1] ?? "";
    return ID.test(id) ? id : null;
  }
  if (!HOSTS.has(host)) return null;

  const v = url.searchParams.get("v");
  if (url.pathname === "/watch" && v && ID.test(v)) return v;

  const [, kind, id = ""] = url.pathname.split("/");
  return ["shorts", "live", "embed", "v"].includes(kind) && ID.test(id) ? id : null;
}

export const youTubeWatchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;

/** hqdefault exists for every public video (maxresdefault doesn't). */
export const youTubeThumbnail = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

/** Privacy-enhanced embed; `enablejsapi` lets the page pause it when another video starts. */
export const youTubeEmbedUrl = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1&enablejsapi=1`;
