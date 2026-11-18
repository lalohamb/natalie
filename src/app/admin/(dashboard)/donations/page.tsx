import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { getBalance, listPaymentIntents } from "@/lib/stripe";
import { getPaymentLinkUrl } from "@/lib/stripe-settings";
import { giving } from "@/content/site";
import { AdminPageHeader, StatusPill } from "../../_components/admin-ui";
import { PaymentLinkForm } from "./donations-controls";

export const metadata: Metadata = { title: "Donations" };

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

export default async function AdminDonationsPage() {
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

  let error: string | null = null;
  let balance: Awaited<ReturnType<typeof getBalance>> | null = null;
  let paymentIntents: Awaited<ReturnType<typeof listPaymentIntents>> | null = null;
  let paymentLinkUrl: string | null = null;

  try {
    [balance, paymentIntents, paymentLinkUrl] = await Promise.all([
      getBalance(),
      listPaymentIntents(100),
      getPaymentLinkUrl(),
    ]);
  } catch (err) {
    error = err instanceof Error ? err.message : "Unknown error";
  }

  const currentUrl = paymentLinkUrl ?? giving.stripeUrl;
  const available = balance?.available.find((b) => b.currency === "usd");
  const pending = balance?.pending.find((b) => b.currency === "usd");

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
        {balance && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Available (USD)", value: available ? fmt(available.amount, "usd") : "—" },
              { label: "Pending (USD)", value: pending ? fmt(pending.amount, "usd") : "—" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col rounded border border-ivory/10 bg-ivory/5 p-4">
                <span className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-mist">{stat.label}</span>
                <span className="mt-1 font-display text-2xl font-medium text-ivory">{stat.value}</span>
              </div>
            ))}
          </div>
        )}

        <section className="rounded border border-ivory/10 bg-ivory/5 p-5">
          <h2 className="mb-4 font-sans text-sm font-semibold text-ivory">Payment Link</h2>
          <PaymentLinkForm currentUrl={currentUrl} />
          <p className="mt-2 font-sans text-xs text-mist">
            Used for the &ldquo;Give by Card&rdquo; button on the{" "}
            <a href="/partnerships#giving" target="_blank" className="text-gold-light underline underline-offset-4 hover:text-ivory">
              Partnerships page
            </a>.
          </p>
        </section>

        {paymentIntents && (
          <section>
            <h2 className="mb-3 font-sans text-sm font-semibold text-ivory">
              Recent payments{paymentIntents.has_more && <span className="font-normal text-mist"> (latest 100)</span>}
            </h2>
            {paymentIntents.data.length === 0 ? (
              <p className="font-sans text-sm text-mist">No payments found.</p>
            ) : (
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
                    {paymentIntents.data.map((pi) => (
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
            )}
          </section>
        )}
      </div>
    </>
  );
}
