import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import { getMediaInfo, statUploadedFile, UPLOAD_URL_PREFIX } from "@/lib/media-store";
import { dataPath } from "@/lib/storage";

/*
 * Images for Open Graph cards are read from disk and inlined as data URLs.
 * Fetching them from the public origin would fail whenever that origin isn't
 * this deployment (before DNS cutover, in previews, during the build).
 */

/** Larger files are skipped — the card renders without the picture instead of stalling. */
const MAX_BYTES = 4 * 1024 * 1024;

const toDataUrl = (mime: string, bytes: Buffer) => `data:${mime};base64,${bytes.toString("base64")}`;

/** A file from `src/assets/images/`, e.g. the portrait. Null if it can't be read. */
export async function assetImageDataUrl(fileName: string): Promise<string | null> {
  const mime = getMediaInfo(fileName)?.mime;
  if (!mime || path.basename(fileName) !== fileName) return null;
  try {
    return toDataUrl(mime, await fs.readFile(dataPath(process.cwd(), "src", "assets", "images", fileName)));
  } catch {
    return null;
  }
}

/** An admin-uploaded file referenced as `/media-files/<name>`. Null for anything else. */
export async function uploadedImageDataUrl(url: string | undefined): Promise<string | null> {
  if (!url?.startsWith(UPLOAD_URL_PREFIX)) return null;
  const name = url.slice(UPLOAD_URL_PREFIX.length);
  const info = getMediaInfo(name);
  const stat = await statUploadedFile(name);
  if (!stat || info?.kind !== "image" || stat.size > MAX_BYTES) return null;
  try {
    return toDataUrl(info.mime, await fs.readFile(stat.filePath));
  } catch {
    return null;
  }
}
