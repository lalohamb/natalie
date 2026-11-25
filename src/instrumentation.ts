import type { Instrumentation } from "next";

/*
 * Server error reporting.
 *
 * Every uncaught server error (pages, Server Actions, Route Handlers, proxy)
 * is written as one JSON line so the host's log viewer can search and alert
 * on it. If ERROR_REPORT_WEBHOOK_URL is set, the same payload is also POSTed
 * there (e.g. a Slack-compatible incoming webhook, which reads `text`).
 *
 * Request headers and bodies are never included — they can carry session
 * cookies and visitor details.
 */
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  const error = err as Error & { digest?: string };
  const report = {
    level: "error",
    source: "nfm-server",
    time: new Date().toISOString(),
    message: error?.message ?? String(err),
    digest: error?.digest,
    method: request.method,
    // Path only: query strings can contain personal data.
    path: request.path.split("?")[0],
    routePath: context.routePath,
    routeType: context.routeType,
    stack: error?.stack?.split("\n").slice(0, 8).join("\n"),
  };
  console.error(JSON.stringify(report));

  const webhook = process.env.ERROR_REPORT_WEBHOOK_URL;
  if (!webhook) return;
  try {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `Site error on ${report.method} ${report.path} (${report.routeType}): ${report.message}`,
        ...report,
      }),
      signal: AbortSignal.timeout(3000),
    });
  } catch (webhookError) {
    console.error("[instrumentation] error webhook failed", webhookError);
  }
};
