import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { readBooks } from "@/lib/book-store";
import { donationLinkFromEnv } from "@/lib/giving";
import { getBalance, listCheckoutOrders, listPaymentIntents } from "@/lib/stripe";
import { AdminPageHeader, StatusPill } from "../../_components/admin-ui";
import { Suspense } from "react";
import { TableFilters, TablePagination } from "../../_components/table-controls";

export const metadata: Metadata = { title: "Donations" };
export const instant = false;

const PAGE_SIZE = 20;

function fmt(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(amount / 100);
}

function fmtDate(unix: number) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(unix * 1000));
}

const CHARGE_TONE: Record<string, "green" | "amber" | "muted"> = {
  succeeded: "green",
  requires_payment_method: "amber",
  requires_action: "amber",
  processing: "amber",
  canceled: "muted",
};

const STATUS_OPTIONS = [
  { value: "succeeded", label: "Succeeded" },
  { value: "processing", label: "Processing" },
  { value: "requires_payment_method", label: "Requires payment" },
  { value: "canceled", label: "Canceled" },
];

export default async function AdminDonationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  await requireAdmin();

  const configured = !!process.env.STRIPE_SECRET_KEY;
  if (!configured) {
    return (
      <>
        <AdminPageHeader title="Donations" description="Stripe donation management." />
        <p className="rounded border border-amber-700/40 bg-amber-900/20 px-4 py-3 font-sans text-sm text-amber-300">
          <code className="font-mono">STRIPE_SECRET_KEY</code> is not set. Add it to your environment and restart the server.
        </p>
      </>
    );
  }

  const sp = await searchParams;
  const q = (sp.q ?? "").toLowerCase();
  const statusFilter = sp.status ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));

  let error: string | null = null;
  let balance: Awaited<ReturnType<typeof getBalance>> | null = null;
  let paymentIntents: Awaited<ReturnType<typeof listPaymentIntents>> | null = null;
  let truncated = false;
  /** PaymentIntents that paid for a catalog book — shown under Book Sales, not here. */
  const bookPaymentIds = new Set<string>();
  try {
    const [bal, intents, sessions, books] = await Promise.all([
      getBalance(),
      listPaymentIntents(),
      listCheckoutOrders(),
      readBooks(),
    ]);
    balance = bal;
    paymentIntents = intents;
    truncated = intents.truncated || sessions.truncated;
    const bookProducts = new Set(books.flatMap((b) => (b.stripeProductId ? [b.stripeProductId] : [])));
    const bookPrices = new Set(books.flatMap((b) => (b.purchase.kind === "stripe-checkout" && b.purchase.priceId ? [b.purchase.priceId] : [])));
    for (const session of sessions.data) {
      if (!session.paymentIntent) continue;
      if (session.productIds.some((id) => bookProducts.has(id)) || session.priceIds.some((id) => bookPrices.has(id))) {
        bookPaymentIds.add(session.paymentIntent.id);
      }
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "Unknown error";
  }
  const balanceStats = balance
    ? [
        ...balance.available.map((b) => ({ label: `Available (${b.currency.toUpperCase()})`, value: fmt(b.amount, b.currency) })),
        ...balance.pending.map((b) => ({ label: `Pending (${b.currency.toUpperCase()})`, value: fmt(b.amount, b.currency) })),
      ]
    : [];
  const donationLink = donationLinkFromEnv();

  const allRows = (paymentIntents?.data ?? []).filter((pi) => !bookPaymentIds.has(pi.id));
  const filtered = allRows.filter((pi) => {
    if (statusFilter && pi.status !== statusFilter) return false;
    if (q) {
      const name = (pi.latest_charge?.billing_details.name ?? "").toLowerCase();
      const email = (pi.latest_charge?.billing_details.email ?? pi.receipt_email ?? "").toLowerCase();
      if (!name.includes(q) && !email.includes(q)) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <>
      <AdminPageHeader
        title="Donations"
        description="Stripe balance and recent giving."
        actions={
          <a
            href="https://dashboard.stripe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-sm border border-ivory/25 px-4 font-sans text-xs font-semibold tracking-[0.06em] text-ivory uppercase transition-colors hover:bg-ivory/10"
          >
            Open Stripe ↗
          </a>
        }
      />

      {error && (
        <p role="alert" className="mb-6 rounded border border-red-800/50 bg-red-950/40 px-4 py-3 font-sans text-sm text-red-300">
          Stripe API error: {error}
        </p>
      )}

      <div className="flex flex-col gap-8">
        {balanceStats.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {balanceStats.map((stat) => (
              <div key={stat.label} className="flex flex-col rounded border border-ivory/10 bg-ivory/5 p-4">
                <span className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-mist">{stat.label}</span>
                <span className="mt-1 font-display text-2xl font-medium text-ivory">{stat.value}</span>
              </div>
            ))}
          </div>
        )}

        <section className="rounded border border-ivory/10 bg-ivory/5 p-5">
          <h2 className="mb-3 font-sans text-sm font-semibold text-ivory">Donation Payment Link</h2>
          <p className="font-sans text-sm text-mist leading-relaxed">
            The &ldquo;Give by Card&rdquo; button on the{" "}
            <a href="/partnerships#giving" target="_blank" className="text-gold-light underline underline-offset-4 hover:text-ivory">
              Partnerships page
            </a>{" "}
            is controlled by the <code className="font-mono text-ivory">STRIPE_DONATION_PAYMENT_LINK</code> environment variable.
            To update it, copy the Payment Link URL from your{" "}
            <a href="https://dashboard.stripe.com/payment-links" target="_blank" rel="noopener noreferrer" className="text-gold-light underline underline-offset-4 hover:text-ivory">
              Stripe Dashboard ↗
            </a>{" "}
            and set it in <code className="font-mono text-ivory">.env.local</code>, then redeploy.
          </p>
          {donationLink ? (
            <p className="mt-3 font-sans text-xs text-green-300">✓ Payment link is configured.</p>
          ) : process.env.STRIPE_DONATION_PAYMENT_LINK ? (
            <p className="mt-3 font-sans text-xs text-amber-300">⚠ <code className="font-mono">STRIPE_DONATION_PAYMENT_LINK</code> is set but is not a donate.stripe.com or buy.stripe.com link, so it is ignored — the button uses the fallback URL from site content.</p>
          ) : (
            <p className="mt-3 font-sans text-xs text-amber-300">⚠ <code className="font-mono">STRIPE_DONATION_PAYMENT_LINK</code> is not set — the button will use the fallback URL from site content.</p>
          )}
        </section>

        {paymentIntents && (
          <section>
            <h2 className="mb-3 font-sans text-sm font-semibold text-ivory">
              Giving and other payments
              {truncated && <span className="font-normal text-mist"> (most recent 1,000)</span>}
            </h2>
            <p className="mb-3 font-sans text-xs text-mist">
              Book orders are listed under Book Sales and left out here. The Stripe balance above covers the whole account.
            </p>

            <div className="mb-3">
              <TableFilters
                q={sp.q ?? ""}
                status={statusFilter}
                statusOptions={STATUS_OPTIONS}
                searchPlaceholder="Search name or email…"
              />
            </div>

            {rows.length === 0 ? (
              <p className="font-sans text-sm text-mist">No payments match the current filters.</p>
            ) : (
              <>
                <div className="overflow-x-auto rounded border border-ivory/10">
                  <table className="w-full font-sans text-sm">
                    <thead>
                      <tr className="border-b border-ivory/10 text-left">
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-mist">Date</th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-mist">Amount</th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-mist">Name</th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-mist">Email</th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-mist">Status</th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-mist sr-only">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ivory/10">
                      {rows.map((pi) => (
                        <tr key={pi.id} className="hover:bg-ivory/5">
                          <td className="px-4 py-3 text-mist tabular-nums">{fmtDate(pi.created)}</td>
                          <td className="px-4 py-3 font-semibold text-ivory tabular-nums">{fmt(pi.amount, pi.currency)}</td>
                          <td className="px-4 py-3 text-ivory">{pi.latest_charge?.billing_details.name ?? "—"}</td>
                          <td className="px-4 py-3 text-mist">{pi.latest_charge?.billing_details.email ?? pi.receipt_email ?? "—"}</td>
                          <td className="px-4 py-3">
                            <StatusPill tone={CHARGE_TONE[pi.status] ?? "muted"}>{pi.status}</StatusPill>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {pi.latest_charge?.receipt_url && (
                              <a
                                href={pi.latest_charge.receipt_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-sans text-xs font-semibold text-gold-light underline underline-offset-4 hover:text-ivory"
                              >
                                Receipt ↗
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 flex items-center justify-between gap-4">
                  <p className="font-sans text-xs text-mist">
                    {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                  </p>
                  <Suspense><TablePagination page={safePage} totalPages={totalPages} /></Suspense>
                </div>
              </>
            )}
          </section>
        )}
      </div>
    </>
  );
}
