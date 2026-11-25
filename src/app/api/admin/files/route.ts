import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-session";
import { isReadOnly } from "@/lib/admin-auth";
import { MAX_UPLOAD_BYTES, saveUpload } from "@/lib/media-store";

/*
 * POST /api/admin/files?name=<original file name>
 * Body: the raw file bytes (not multipart), streamed straight to disk so large
 * videos are never buffered in memory. Server Actions aren't used here because
 * they buffer the whole body and cap its size.
 */
export async function POST(request: NextRequest) {
  if (!(await verifySessionToken(request.cookies.get(ADMIN_COOKIE)?.value))) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  // Same-origin only — the session cookie is SameSite=Lax, which still allows top-level cross-site navigations.
  const origin = request.headers.get("origin");
  if (!origin || new URL(origin).host !== request.headers.get("host")) {
    return Response.json({ error: "Cross-origin upload rejected." }, { status: 403 });
  }

  if (isReadOnly()) {
    return Response.json({ error: "The admin is read-only in this environment." }, { status: 403 });
  }

  const name = request.nextUrl.searchParams.get("name");
  if (!name) return Response.json({ error: "Missing file name." }, { status: 400 });
  if (!request.body) return Response.json({ error: "Missing file body." }, { status: 400 });

  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_UPLOAD_BYTES) {
    return Response.json(
      { error: `File exceeds the ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB limit.` },
      { status: 413 },
    );
  }

  try {
    const result = await saveUpload(name, request.body);
    if (!result.ok) return Response.json({ error: result.error }, { status: 400 });
    return Response.json({ file: result.file }, { status: 201 });
  } catch (err) {
    console.error("[admin/files] upload failed", err);
    return Response.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
