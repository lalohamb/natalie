import "server-only";

import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

/*
 * Runtime data directory for admin-managed state (video library, uploads,
 * Google Calendar connection). Defaults to ./storage; in production
 * MEDIA_STORAGE_DIR must point at a persistent, writable disk.
 */

/** path.join for runtime data paths — the ignore comment stops Turbopack tracing the whole project. */
export const dataPath = (...segments: string[]) => path.join(/*turbopackIgnore: true*/ ...segments);

export const STORAGE_DIR = path.resolve(
  // `||`, not `??`: an empty MEDIA_STORAGE_DIR= (as copied from .env.example) means "use the default".
  /*turbopackIgnore: true*/ process.env.MEDIA_STORAGE_DIR || dataPath(process.cwd(), "storage"),
);

export async function writeFileAtomic(filePath: string, data: string, mode?: number) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const temp = `${filePath}.${randomUUID().slice(0, 8)}.tmp`;
  await fs.writeFile(temp, data, { encoding: "utf8", mode });
  await fs.rename(temp, filePath);
}
