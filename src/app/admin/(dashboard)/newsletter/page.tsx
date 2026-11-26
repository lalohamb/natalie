import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { getStats, listGroups, listSubscribers } from "@/lib/mailerlite";
import { AdminPageHeader, StatusPill } from "../../_components/admin-ui";
import { DeleteSubscriberButton } from "./newsletter-controls";

export const metadata: Metadata = { title: "Newsletter" };
export const instant = false;

const STATUS_TONE: Record<string, "green" | "amber" | "muted"> = {
  active: "green",
  unsubscribed: "muted",
  unconfirmed: "amber",
  bounced: "muted",
  junk: "muted",
};

export default async function AdminNewsletterPage({ searchParams }: PageProps<"/admin/newsletter">) {
  await requireAdmin();

  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const configured = !!process.env.MAILERLITE_API_KEY;
  if (!configured) {
    return (
      <>
        <AdminPageHeader title="Newsletter" description="MailerLite subscriber management." />
        <p className="rounded border border-amber-700/40 bg-amber-900/20 px-4 py-3 font-sans text-sm text-amber-300">
          <code className="font-mono">MAILERLITE_API_KEY</code> is not set. Add it to your environment and restart the server.
        </p>
      </>
    );
  }

  let error: string | null = null;
  let stats = { total: 0, active: 0, unsubscribed: 0, unconfirmed: 0, bounced: 0, junk: 0 };
  let groups: Awaited<ReturnType<typeof listGroups>> = [];
  let subscribers: Awaited<ReturnType<typeof listSubscribers>> = { data: [], total: 0, lastPage: 1 };

  try {
    [stats, groups, subscribers] = await Promise.all([getStats(), listGroups(), listSubscribers(page)]);
  } catch (err) {
    error = err instanceof Error ? err.message : "Unknown error";
  }

  const groupId = process.env.MAILERLITE_GROUP_ID;

  return (
    <>
      <AdminPageHeader
        title="Newsletter"
        description="MailerLite subscriber management."
        actions={
          <div className="flex gap-2">
            <a
              href="/api/admin/newsletter"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-sm border border-ivory/25 px-4 font-sans text-xs font-semibold tracking-[0.06em] text-ivory uppercase transition-colors hover:bg-ivory/10"
            >
              Export CSV ↓
            </a>
            <a
              href="https://dashboard.mailerlite.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-sm border border-ivory/25 px-4 font-sans text-xs font-semibold tracking-[0.06em] text-ivory uppercase transition-colors hover:bg-ivory/10"
            >
              Open MailerLite ↗
            </a>
          </div>
        }
      />

      {error && (
        <p role="alert" className="mb-6 rounded border border-red-800/50 bg-red-950/40 px-4 py-3 font-sans text-sm text-red-300">
          MailerLite API error: {error}
        </p>
      )}

      {/* Guidance panel */}
      <details className="mb-8 rounded border border-ivory/10 bg-ivory/5">
        <summary className="cursor-pointer px-5 py-4 font-sans text-sm font-semibold text-ivory select-none">
          How to use MailerLite (free plan) ▾
        </summary>
        <div className="border-t border-ivory/10 px-5 py-4 flex flex-col gap-4 font-sans text-sm text-mist">
          <div>
            <p className="font-semibold text-ivory mb-1">What this page does</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Shows all subscribers and their status (active, unconfirmed, unsubscribed)</li>
              <li>Lets you delete individual subscribers</li>
              <li>Exports active subscribers to CSV for use in other tools</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-ivory mb-1">What you do in MailerLite</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong className="text-ivory">Send campaigns</strong> — go to Campaigns → Create campaign. The free plan allows up to 12,000 emails/month to 1,000 subscribers.</li>
              <li><strong className="text-ivory">Set up double opt-in</strong> — go to Settings → Double opt-in to require subscribers to confirm their email. Recommended to keep your list clean.</li>
              <li><strong className="text-ivory">Create a group</strong> — go to Subscribers → Groups → Add group. Copy the group ID into <code className="font-mono text-gold-light">MAILERLITE_GROUP_ID</code> so new sign-ups are added to it automatically.</li>
              <li><strong className="text-ivory">Design a welcome email</strong> — go to Automations → Create automation → trigger: &quot;Subscriber joins a group&quot;. Send a welcome email automatically when someone signs up.</li>
              <li><strong className="text-ivory">Unsubscribe handling</strong> — MailerLite handles this automatically. Unsubscribed contacts stay in your list but are never emailed.</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-ivory mb-1">Current configuration</p>
            <ul className="list-disc list-inside space-y-1">
              <li>API key: <span className="text-green-400">✓ configured</span></li>
              <li>
                Group ID:{" "}
                {groupId
                  ? <><span className="text-green-400">✓</span> <code className="font-mono text-gold-light">{groupId}</code> — new sign-ups are added to this group</>
                  : <span className="text-amber-400">○ not set — new sign-ups are added to the account but no group. Set <code className="font-mono">MAILERLITE_GROUP_ID</code> to fix this.</span>
                }
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-ivory mb-1">Free plan limits</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Up to 1,000 subscribers</li>
              <li>Up to 12,000 emails per month</li>
              <li>Campaigns, automations, and landing pages are included</li>
              <li>MailerLite branding appears in emails on the free plan</li>
              <li>Upgrade at <a href="https://www.mailerlite.com/pricing" target="_blank" rel="noopener noreferrer" className="text-gold-light underline underline-offset-4 hover:text-ivory">mailerlite.com/pricing</a> to remove branding and unlock advanced features</li>
            </ul>
          </div>
        </div>
      </details>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {(["total", "active", "unsubscribed", "unconfirmed", "bounced", "junk"] as const).map((key) => (
          <div key={key} className="flex flex-col rounded border border-ivory/10 bg-ivory/5 p-4">
            <span className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-mist">{key}</span>
            <span className="mt-1 font-display text-2xl font-medium text-ivory">{stats[key].toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* Groups */}
      {groups.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 font-sans text-sm font-semibold text-ivory">Groups</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((g) => (
              <div key={g.id} className="flex items-center justify-between rounded border border-ivory/10 bg-ivory/5 px-4 py-3">
                <div>
                  <span className="font-sans text-sm text-ivory">{g.name}</span>
                  <p className="font-mono text-[0.65rem] text-mist mt-0.5">{g.id}{groupId === g.id ? " — active sign-up group" : ""}</p>
                </div>
                <span className="font-sans text-sm font-semibold text-gold-light">{g.active_count.toLocaleString()} active</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Subscribers table */}
      <section className="mt-8">
        <h2 className="mb-3 font-sans text-sm font-semibold text-ivory">
          Subscribers{" "}
          <span className="font-normal text-mist">
            (page {page} of {subscribers.lastPage})
          </span>
        </h2>

        {subscribers.data.length === 0 ? (
          <p className="font-sans text-sm text-mist">No subscribers found.</p>
        ) : (
          <div className="overflow-x-auto rounded border border-ivory/10">
            <table className="w-full font-sans text-sm">
              <thead>
                <tr className="border-b border-ivory/10 text-left">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-mist">Email</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-mist">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-mist">Subscribed</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-mist sr-only">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory/10">
                {subscribers.data.map((sub) => (
                  <tr key={sub.id} className="hover:bg-ivory/5">
                    <td className="px-4 py-3 text-ivory">{sub.email}</td>
                    <td className="px-4 py-3">
                      <StatusPill tone={STATUS_TONE[sub.status] ?? "muted"}>{sub.status}</StatusPill>
                    </td>
                    <td className="px-4 py-3 text-mist tabular-nums">
                      {sub.subscribed_at
                        ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(sub.subscribed_at))
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DeleteSubscriberButton id={sub.id} email={sub.email} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {subscribers.lastPage > 1 && (
          <div className="mt-4 flex items-center gap-3">
            {page > 1 && (
              <Link
                href={`/admin/newsletter?page=${page - 1}`}
                className="font-sans text-xs font-semibold text-gold-light underline underline-offset-4 hover:text-ivory"
              >
                ← Previous
              </Link>
            )}
            <span className="font-sans text-xs text-mist">
              {page} / {subscribers.lastPage}
            </span>
            {page < subscribers.lastPage && (
              <Link
                href={`/admin/newsletter?page=${page + 1}`}
                className="font-sans text-xs font-semibold text-gold-light underline underline-offset-4 hover:text-ivory"
              >
                Next →
              </Link>
            )}
          </div>
        )}
      </section>
    </>
  );
}
