import "server-only";

const BASE = "https://connect.mailerlite.com/api";

function headers() {
  const key = process.env.MAILERLITE_API_KEY;
  if (!key) throw new Error("MAILERLITE_API_KEY is not set");
  return { "Content-Type": "application/json", Authorization: `Bearer ${key}` };
}

export type MLSubscriber = {
  id: string;
  email: string;
  status: string;
  subscribed_at: string | null;
  fields: Record<string, string | null>;
};

export type MLGroup = {
  id: string;
  name: string;
  active_count: number;
  unsubscribed_count: number;
  total: number;
};

export type MLStats = {
  total: number;
  active: number;
  unsubscribed: number;
  unconfirmed: number;
  bounced: number;
  junk: number;
};

export async function getStats(): Promise<MLStats> {
  const res = await fetch(`${BASE}/subscribers?limit=0`, {
    headers: headers(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`MailerLite /subscribers error ${res.status}`);
  const json = (await res.json()) as { meta?: { aggregations?: MLStats } };
  return json.meta?.aggregations ?? { total: 0, active: 0, unsubscribed: 0, unconfirmed: 0, bounced: 0, junk: 0 };
}

export async function listGroups(): Promise<MLGroup[]> {
  const res = await fetch(`${BASE}/groups?limit=100`, {
    headers: headers(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`MailerLite /groups error ${res.status}`);
  const json = (await res.json()) as { data: MLGroup[] };
  return json.data;
}

export async function listSubscribers(page = 1, limit = 25): Promise<{ data: MLSubscriber[]; total: number; lastPage: number }> {
  const res = await fetch(`${BASE}/subscribers?limit=${limit}&page=${page}&sort=-subscribed_at`, {
    headers: headers(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`MailerLite /subscribers error ${res.status}`);
  const json = (await res.json()) as { data: MLSubscriber[]; meta: { total: number; last_page: number } };
  return { data: json.data, total: json.meta.total, lastPage: json.meta.last_page };
}

export async function deleteSubscriber(id: string): Promise<void> {
  const res = await fetch(`${BASE}/subscribers/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
  if (!res.ok && res.status !== 404) throw new Error(`MailerLite DELETE /subscribers/${id} error ${res.status}`);
}
