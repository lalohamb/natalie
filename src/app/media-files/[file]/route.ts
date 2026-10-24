import type { NextRequest } from "next/server";
import { getMediaInfo, openUploadedFile, statUploadedFile } from "@/lib/media-store";

/*
 * Serves files uploaded through /admin. Uploads land outside /public (files
 * added to /public after `next build` aren't served), so they're streamed from
 * the media store here, with HTTP Range support so video seeking works.
 */

async function serve(request: NextRequest, ctx: RouteContext<"/media-files/[file]">, headOnly: boolean) {
  const { file: name } = await ctx.params;
  const stat = await statUploadedFile(name);
  const info = getMediaInfo(name);
  if (!stat || !info) return new Response("Not found", { status: 404 });

  const headers = new Headers({
    "Content-Type": info.mime,
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=3600",
    "Last-Modified": stat.mtime.toUTCString(),
    "X-Content-Type-Options": "nosniff",
  });

  const range = parseRange(request.headers.get("range"), stat.size);
  if (range === "invalid") {
    headers.set("Content-Range", `bytes */${stat.size}`);
    return new Response(null, { status: 416, headers });
  }

  if (range) {
    headers.set("Content-Range", `bytes ${range.start}-${range.end}/${stat.size}`);
    headers.set("Content-Length", String(range.end - range.start + 1));
    return new Response(headOnly ? null : openUploadedFile(stat.filePath, range), { status: 206, headers });
  }

  headers.set("Content-Length", String(stat.size));
  return new Response(headOnly ? null : openUploadedFile(stat.filePath), { status: 200, headers });
}

/** Parses a single `bytes=start-end` range. Multi-range requests fall back to the full file. */
function parseRange(header: string | null, size: number) {
  if (!header) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match) return null;
  const [, rawStart, rawEnd] = match;
  if (!rawStart && !rawEnd) return "invalid" as const;

  let start: number;
  let end: number;
  if (!rawStart) {
    // Suffix range: the last N bytes.
    start = Math.max(size - Number(rawEnd), 0);
    end = size - 1;
  } else {
    start = Number(rawStart);
    end = rawEnd ? Math.min(Number(rawEnd), size - 1) : size - 1;
  }
  if (start >= size || start > end) return "invalid" as const;
  return { start, end };
}

export function GET(request: NextRequest, ctx: RouteContext<"/media-files/[file]">) {
  return serve(request, ctx, false);
}

export function HEAD(request: NextRequest, ctx: RouteContext<"/media-files/[file]">) {
  return serve(request, ctx, true);
}
