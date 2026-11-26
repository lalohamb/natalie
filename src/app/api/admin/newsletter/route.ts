import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-session";
import { listAllActiveSubscribers } from "@/lib/mailerlite";

export async function GET(request: NextRequest) {
  if (!(await verifySessionToken(request.cookies.get(ADMIN_COOKIE)?.value))) {
    return new Response("Not signed in.", { status: 401 });
  }

  const subscribers = await listAllActiveSubscribers();

  const rows = [
    ["Email", "Subscribed At"],
    ...subscribers.map((s) => [s.email, s.subscribed_at ?? ""]),
  ];

  const csv = rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
