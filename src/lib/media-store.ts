import "server-only";

import { randomUUID } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { z } from "zod";
import { videos as seedVideos } from "@/content/media";
import { STORAGE_DIR, dataPath, writeFileAtomic } from "@/lib/storage";
import type { CuratedVideo } from "@/content/types";

/*
 * File-backed store for the admin-managed video library.
 *
 *   <MEDIA_STORAGE_DIR>/videos.json   video entries (falls back to src/content/media.ts)
 *   <MEDIA_STORAGE_DIR>/files/        uploaded media, served at /media-files/<name>
 *
 * MEDIA_STORAGE_DIR defaults to ./storage. In production it must point at a
 * persistent, writable disk — a read-only or ephemeral filesystem (e.g. Vercel
 * serverless) will lose uploads and edits.
 */

const MANIFEST_PATH = dataPath(STORAGE_DIR, "videos.json");
const FILES_DIR = dataPath(STORAGE_DIR, "files");
const PUBLIC_DIR = dataPath(process.cwd(), "public");

export const UPLOAD_URL_PREFIX = "/media-files/";

/** Upload ceiling. Override with MEDIA_MAX_UPLOAD_MB. */
export const MAX_UPLOAD_BYTES = (Number(process.env.MEDIA_MAX_UPLOAD_MB) || 1024) * 1024 * 1024;

export const MEDIA_TYPES = {
  ".mp4": { mime: "video/mp4", kind: "video" },
  ".m4v": { mime: "video/mp4", kind: "video" },
  ".webm": { mime: "video/webm", kind: "video" },
  ".mov": { mime: "video/quicktime", kind: "video" },
  ".jpg": { mime: "image/jpeg", kind: "image" },
  ".jpeg": { mime: "image/jpeg", kind: "image" },
  ".png": { mime: "image/png", kind: "image" },
  ".webp": { mime: "image/webp", kind: "image" },
} as const;

type MediaExtension = keyof typeof MEDIA_TYPES;
export type MediaKind = (typeof MEDIA_TYPES)[MediaExtension]["kind"];

export type MediaFile = {
  name: string;
  url: string;
  size: number;
  modifiedAt: string;
  kind: MediaKind;
  /** Bundled files live in /public, ship with the build, and can't be deleted from the dashboard. */
  source: "upload" | "bundled";
};

export const VIDEO_CATEGORIES = [
  "ministry-message",
  "biblical-teaching",
  "interview",
  "personal-reflection",
  "event-highlight",
] as const;

const videoSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  category: z.enum(VIDEO_CATEGORIES),
  facebookUrl: z.string().optional(),
  embeddable: z.boolean(),
  localSrc: z.string().optional(),
  posterSrc: z.string().optional(),
  youtubeId: z.string().regex(/^[A-Za-z0-9_-]{11}$/).optional(),
  featured: z.boolean(),
  published: z.boolean(),
  displayOrder: z.number(),
  createdAt: z.string(),
});

const manifestSchema = z.array(videoSchema);

// ---------------------------------------------------------------------------
// Videos
// ---------------------------------------------------------------------------

export async function readVideos(): Promise<CuratedVideo[]> {
  let raw: string;
  try {
    raw = await fs.readFile(MANIFEST_PATH, "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return structuredClone(seedVideos);
    throw err;
  }
  return manifestSchema.parse(JSON.parse(raw)).sort((a, b) => a.displayOrder - b.displayOrder);
}

/** Serialises read-modify-write cycles so concurrent admin edits don't clobber each other. */
let writeQueue: Promise<unknown> = Promise.resolve();

export function updateVideos<T>(mutate: (videos: CuratedVideo[]) => T | Promise<T>): Promise<T> {
  const run = writeQueue.then(async () => {
    const videos = await readVideos();
    const result = await mutate(videos);
    // Re-number so displayOrder stays a dense 1..n sequence.
    videos.sort((a, b) => a.displayOrder - b.displayOrder).forEach((v, i) => (v.displayOrder = i + 1));
    await writeFileAtomic(MANIFEST_PATH, JSON.stringify(manifestSchema.parse(videos), null, 2) + "\n");
    return result;
  });
  writeQueue = run.catch(() => {});
  return run;
}

export const newVideoId = () => `v-${randomUUID().slice(0, 8)}`;

// ---------------------------------------------------------------------------
// Files
// ---------------------------------------------------------------------------

function typeForExtension(ext: string) {
  return MEDIA_TYPES[ext.toLowerCase() as MediaExtension] as (typeof MEDIA_TYPES)[MediaExtension] | undefined;
}

function mediaType(name: string) {
  return typeForExtension(path.extname(name));
}

/** Strict allow-list for stored names: no separators, no leading dot, known extension. */
export function isValidStoredName(name: string) {
  return /^[a-z0-9][a-z0-9._-]{0,150}$/.test(name) && !name.includes("..") && !!mediaType(name);
}

/** Turns an arbitrary client filename into a safe, lower-case slug with an allowed extension. */
export function sanitizeFileName(original: string): string | null {
  const ext = path.extname(original).toLowerCase();
  if (!typeForExtension(ext)) return null;
  const base =
    path
      .basename(original, path.extname(original))
      .normalize("NFKD")
      .replace(/[^\w\s.-]/g, "")
      .toLowerCase()
      .replace(/[\s._]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 100) || "media";
  return `${base}${ext}`;
}

export function getMediaInfo(name: string) {
  return mediaType(name);
}

export async function listFiles(): Promise<MediaFile[]> {
  const [uploads, bundled] = await Promise.all([
    scanDir(FILES_DIR, "upload", (name) => `${UPLOAD_URL_PREFIX}${name}`),
    scanDir(PUBLIC_DIR, "bundled", (name) => `/${name}`, "video"),
  ]);
  return [...uploads, ...bundled].sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
}

async function scanDir(
  dir: string,
  source: MediaFile["source"],
  toUrl: (name: string) => string,
  onlyKind?: MediaKind,
): Promise<MediaFile[]> {
  let entries: string[];
  try {
    entries = await fs.readdir(dir);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
  const files = await Promise.all(
    entries.map(async (name): Promise<MediaFile | null> => {
      const type = mediaType(name);
      if (!type || (onlyKind && type.kind !== onlyKind) || name.endsWith(".part")) return null;
      const stat = await fs.stat(dataPath(dir, name));
      if (!stat.isFile()) return null;
      return {
        name,
        url: toUrl(name),
        size: stat.size,
        modifiedAt: stat.mtime.toISOString(),
        kind: type.kind,
        source,
      };
    }),
  );
  return files.filter((f): f is MediaFile => f !== null);
}

/** Absolute path of an uploaded file, or null if the name is unsafe. */
export function uploadedFilePath(name: string): string | null {
  return isValidStoredName(name) ? dataPath(FILES_DIR, name) : null;
}

export async function statUploadedFile(name: string) {
  const filePath = uploadedFilePath(name);
  if (!filePath) return null;
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile() ? { filePath, size: stat.size, mtime: stat.mtime } : null;
  } catch {
    return null;
  }
}

export function openUploadedFile(filePath: string, range?: { start: number; end: number }) {
  return Readable.toWeb(createReadStream(filePath, range)) as ReadableStream<Uint8Array>;
}

/**
 * Streams a request body to disk without buffering it in memory. Writes to a
 * temporary `.part` file first so a failed upload never leaves a truncated file
 * behind. Picks a unique name if one already exists.
 */
export async function saveUpload(
  originalName: string,
  body: ReadableStream<Uint8Array>,
): Promise<{ ok: true; file: MediaFile } | { ok: false; error: string }> {
  const safeName = sanitizeFileName(originalName);
  if (!safeName) {
    return { ok: false, error: `Unsupported file type. Allowed: ${Object.keys(MEDIA_TYPES).join(", ")}` };
  }

  await fs.mkdir(FILES_DIR, { recursive: true });
  const name = await uniqueName(safeName);
  const finalPath = dataPath(FILES_DIR, name);
  const tempPath = `${finalPath}.${randomUUID().slice(0, 8)}.part`;

  let bytes = 0;
  const limiter = new Transform({
    transform(chunk: Buffer, _enc, callback) {
      bytes += chunk.length;
      if (bytes > MAX_UPLOAD_BYTES) callback(new UploadTooLargeError());
      else callback(null, chunk);
    },
  });

  try {
    await pipeline(
      Readable.fromWeb(body as import("node:stream/web").ReadableStream),
      limiter,
      createWriteStream(tempPath, { flags: "wx" }),
    );
    if (bytes === 0) throw new EmptyUploadError();
    await fs.rename(tempPath, finalPath);
  } catch (err) {
    await fs.rm(tempPath, { force: true });
    if (err instanceof UploadTooLargeError) {
      return { ok: false, error: `File exceeds the ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB limit.` };
    }
    if (err instanceof EmptyUploadError) return { ok: false, error: "The file is empty." };
    throw err;
  }

  const stat = await fs.stat(finalPath);
  return {
    ok: true,
    file: {
      name,
      url: `${UPLOAD_URL_PREFIX}${name}`,
      size: stat.size,
      modifiedAt: stat.mtime.toISOString(),
      kind: mediaType(name)!.kind,
      source: "upload",
    },
  };
}

export async function deleteUploadedFile(name: string): Promise<boolean> {
  const filePath = uploadedFilePath(name);
  if (!filePath) return false;
  try {
    await fs.unlink(filePath);
    return true;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw err;
  }
}

/** Videos that reference a file URL as their source or poster. */
export function videosUsingUrl(videos: CuratedVideo[], url: string) {
  return videos.filter((v) => v.localSrc === url || v.posterSrc === url);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

class UploadTooLargeError extends Error {}
class EmptyUploadError extends Error {}

async function uniqueName(name: string) {
  const ext = path.extname(name);
  const base = name.slice(0, -ext.length);
  for (let i = 0; ; i++) {
    const candidate = i === 0 ? name : `${base}-${i}${ext}`;
    try {
      await fs.access(dataPath(FILES_DIR, candidate));
    } catch {
      return candidate;
    }
  }
}
