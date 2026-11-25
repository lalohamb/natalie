import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { readBooks } from "@/lib/book-store";
import { checkoutFulfilment, listCheckoutOrders, type StripePaymentIntent, type StripeShipping } from "@/lib/stripe";
import { AdminPageHeader, StatusPill } from "../../_components/admin-ui";
import { Suspense } from "react";
import { TableFilters, TablePagination } from "../../_components/table-controls";

export const metadata: Metadata = { title: "Book Sales" };

const PAGE_SIZE = 25;

function fmt(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(amount / 100);
}

function fmtDate(unix: number) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(unix * 1000));
}

const STATUS_TONE: Record<string, "green" | "amber" | "muted"> = {
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

type OrderRow = StripePaymentIntent & { bookSlug: string; bookTitle: string; shipTo: StripeShipping | null };

/** One address per line, as it should appear on a parcel. */
function addressLines(shipping: StripeShipping) {
  const a = shipping.address;
  return [
    shipping.name,
    a?.line1,
    a?.line2,
    [a?.city, a?.state, a?.postal_code].filter(Boolean).join(", "),
    a?.country,
  ].filter((line): line is string => Boolean(line));
}

export default async function AdminBookSalesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  await requireAdmin();

  const configured = !!process.env.STRIPE_SECRET_KEY;
  if (!configured) {
    return (
      <>
        <AdminPageHeader title="Book Sales" description="Stripe book order management." />
        <p className="rounded border border-amber-700/40 bg-amber-900/20 px-4 py-3 font-sans text-sm text-amber-300">
          <code className="font-mono">STRIPE_SECRET_KEY</code> is not set. Add it to your environment and restart the server.
        </p>
      </>
    );
  }

  const sp = await searchParams;
  const q = (sp.q ?? "").toLowerCase();
  const statusFilter = sp.status ?? "";
  const bookFilter = sp.book ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));

  // Books sold through Stripe: matched to orders by Stripe product id, or by
  // the checkout price id when no product id was entered.
  const stripeBooks = (await readBooks()).filter(
    (b) => b.stripeProductId || (b.purchase.kind === "stripe-checkout" && b.purchase.priceId),
  );

  let error: string | null = null;
  let truncated = false;
  type BookStat = { slug: string; title: string; revenue: Map<string, number>; orderCount: number };
  const bookStats: BookStat[] = stripeBooks.map((b) => ({ slug: b.slug, title: b.title, revenue: new Map(), orderCount: 0 }));
  const allOrders: OrderRow[] = [];

  try {
    const sessions = await listCheckoutOrders();
    truncated = sessions.truncated;
    for (const session of sessions.data) {
      const pi = session.paymentIntent;
      if (!pi) continue;
      const index = stripeBooks.findIndex(
        (b) =>
          (b.stripeProductId && session.productIds.includes(b.stripeProductId)) ||
          (b.purchase.kind === "stripe-checkout" && session.priceIds.includes(b.purchase.priceId)),
      );
      if (index < 0) continue;
      const book = stripeBooks[index];
      allOrders.push({ ...pi, bookSlug: book.slug, bookTitle: book.title, shipTo: session.shipping });
      if (pi.status === "succeeded") {
        const stat = bookStats[index];
        stat.orderCount++;
        stat.revenue.set(pi.currency, (stat.revenue.get(pi.currency) ?? 0) + pi.amount);
      }
    }
    allOrders.sort((a, b) => b.created - a.created);
  } catch (err) {
    error = err instanceof Error ? err.message : "Unknown error";
  }

  const filtered = allOrders.filter((pi) => {
    if (bookFilter && pi.bookSlug !== bookFilter) return false;
    if (statusFilter && pi.status !== statusFilter) return false;
    if (q) {
      const name = (pi.latest_charge?.billing_details.name ?? "").toLowerCase();
      const email = (pi.latest_charge?.billing_details.email ?? pi.receipt_email ?? "").toLowerCase();
      const shipTo = pi.shipTo ? addressLines(pi.shipTo).join(" ").toLowerCase() : "";
      if (!name.includes(q) && !email.includes(q) && !shipTo.includes(q)) return false;
    }
    return true;
  });

  const fulfilment = checkoutFulfilment();

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Revenue is kept per currency — amounts in different currencies are never added together.
  const totalRevenue = new Map<string, number>();
  for (const stat of bookStats) {
    for (const [currency, amount] of stat.revenue) totalRevenue.set(currency, (totalRevenue.get(currency) ?? 0) + amount);
  }
  const fmtRevenue = (revenue: Map<string, number>) =>
    revenue.size === 0 ? fmt(0, "usd") : [...revenue].map(([currency, amount]) => fmt(amount, currency)).join(" + ");
  const totalOrders = bookStats.reduce((s, b) => s + b.orderCount, 0);
  const bookOptions = stripeBooks.map((b) => ({ value: b.slug, label: b.title }));

  return (
    <>
      <AdminPageHeader
        title="Book Sales"
        description="Orders and revenue from Stripe."
        actions={
          <a
            href="https://dashboard.stripe.com/products"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-sm border border-ivory/25 px-4 font-sans text-xs font-semibold tracking-[0.06em] text-ivory uppercase transition-colors hover:bg-ivory/10"
          >
            Stripe Products ↗
          </a>
        }
      />

      {error && (
        <p role="alert" className="mb-6 rounded border border-red-800/50 bg-red-950/40 px-4 py-3 font-sans text-sm text-red-300">
          Stripe API error: {error}
        </p>
      )}

      <p className="mb-6 font-sans text-xs text-mist">
        Checkout collects a delivery address in: {fulfilment.shippingCountries.join(", ")}.{" "}
        {fulfilment.shippingRateId ? "A shipping fee is added from the configured Stripe Shipping Rate." : "No shipping fee is added."}{" "}
        {fulfilment.automaticTax ? "Stripe Tax is on." : "Sales tax is not calculated."}
      </p>

      {truncated && (
        <p role="status" className="mb-6 rounded border border-amber-700/40 bg-amber-900/20 px-4 py-3 font-sans text-sm text-amber-300">
          Showing the most recent 1,000 checkout sessions. Older orders are in the Stripe Dashboard.
        </p>
      )}

      {bookStats.length > 0 && !error && (
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex flex-col rounded border border-ivory/10 bg-ivory/5 p-4">
            <span className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-mist">Total Revenue</span>
            <span className="mt-1 font-display text-2xl font-medium text-ivory">{fmtRevenue(totalRevenue)}</span>
          </div>
          <div className="flex flex-col rounded border border-ivory/10 bg-ivory/5 p-4">
            <span className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-mist">Total Orders</span>
            <span className="mt-1 font-display text-2xl font-medium text-ivory">{totalOrders}</span>
          </div>
          {bookStats.map((b) => (
            <div key={b.slug} className="flex flex-col rounded border border-ivory/10 bg-ivory/5 p-4">
              <span className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-mist truncate" title={b.title}>
                {b.title}
              </span>
              <span className="mt-1 font-display text-2xl font-medium text-ivory">{fmtRevenue(b.revenue)}</span>
              <span className="font-sans text-xs text-mist">{b.orderCount} order{b.orderCount !== 1 ? "s" : ""}</span>
            </div>
          ))}
        </div>
      )}

      {stripeBooks.length === 0 ? (
        <p className="font-sans text-sm text-mist">No books are set up for Stripe Checkout yet.</p>
      ) : (
        <>
          <div className="mb-4">
            <TableFilters
              q={sp.q ?? ""}
              status={statusFilter}
              book={bookFilter}
              statusOptions={STATUS_OPTIONS}
              bookOptions={bookOptions}
              searchPlaceholder="Search name, email or address…"
            />
          </div>

          {rows.length === 0 ? (
            <p className="font-sans text-sm text-mist">No orders match the current filters.</p>
          ) : (
            <>
              <div className="overflow-x-auto rounded border border-ivory/10">
                <table className="w-full font-sans text-sm">
                  <thead>
                    <tr className="border-b border-ivory/10 text-left">
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-mist">Date</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-mist">Book</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-mist">Amount</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-mist">Name</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-mist">Email</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-mist">Ship to</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-mist">Status</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-mist sr-only">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ivory/10">
                    {rows.map((pi) => (
                      <tr key={pi.id} className="hover:bg-ivory/5">
                        <td className="px-4 py-3 text-mist tabular-nums whitespace-nowrap">{fmtDate(pi.created)}</td>
                        <td className="px-4 py-3 text-ivory max-w-[160px] truncate" title={pi.bookTitle}>{pi.bookTitle}</td>
                        <td className="px-4 py-3 font-semibold text-ivory tabular-nums">{fmt(pi.amount, pi.currency)}</td>
                        <td className="px-4 py-3 text-ivory">{pi.latest_charge?.billing_details.name ?? "—"}</td>
                        <td className="px-4 py-3 text-mist">{pi.latest_charge?.billing_details.email ?? pi.receipt_email ?? "—"}</td>
                        <td className="px-4 py-3 text-ivory whitespace-pre-line">
                          {pi.shipTo ? addressLines(pi.shipTo).join("\n") : <span className="text-mist">No address on this order</span>}
                        </td>
                        <td className="px-4 py-3">
                          <StatusPill tone={STATUS_TONE[pi.status] ?? "muted"}>{pi.status}</StatusPill>
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
        </>
      )}
    </>
  );
}
