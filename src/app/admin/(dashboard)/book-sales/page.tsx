import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { listPricesByProduct, listOrdersByProduct } from "@/lib/stripe";
import { books } from "@/content/books";
import { AdminPageHeader, StatusPill } from "../../_components/admin-ui";

export const metadata: Metadata = { title: "Book Sales" };

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

export default async function AdminBookSalesPage() {
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

  const stripeBooks = books.filter((b) => b.stripeProductId);

  let error: string | null = null;
  type BookSalesData = {
    book: (typeof stripeBooks)[number];
    prices: Awaited<ReturnType<typeof listPricesByProduct>>;
    orders: Awaited<ReturnType<typeof listOrdersByProduct>>;
  };
  let bookSales: BookSalesData[] = [];

  try {
    bookSales = await Promise.all(
      stripeBooks.map(async (book) => ({
        book,
        prices: await listPricesByProduct(book.stripeProductId!),
        orders: await listOrdersByProduct(book.stripeProductId!),
      })),
    );
  } catch (err) {
    error = err instanceof Error ? err.message : "Unknown error";
  }

  return (
    <>
      <AdminPageHeader
        title="Book Sales"
        description="Orders and revenue per book sold through Stripe."
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

      {stripeBooks.length === 0 && (
        <p className="font-sans text-sm text-mist">No books have a Stripe Product ID set.</p>
      )}

      <div className="flex flex-col gap-10">
        {bookSales.map(({ book, prices, orders }) => {
          const succeeded = orders.filter((o) => o.status === "succeeded");
          const totalRevenue = succeeded.reduce((sum, o) => sum + o.amount, 0);
          const price = prices[0];

          return (
            <section key={book.slug} className="flex flex-col gap-4">
              {/* Book header */}
              <div className="flex flex-wrap items-start justify-between gap-4 rounded border border-ivory/10 bg-ivory/5 p-5">
                <div>
                  <p className="font-sans text-xs font-semibold uppercase tracking-[0.12em] text-mist">Book</p>
                  <h2 className="mt-1 font-display text-xl font-medium text-ivory">{book.title}</h2>
                  {book.subtitle && <p className="mt-0.5 font-sans text-xs text-mist">{book.subtitle}</p>}
                </div>
                <div className="flex flex-wrap gap-6 text-right">
                  <div>
                    <p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-mist">Price</p>
                    <p className="mt-1 font-display text-xl font-medium text-ivory">
                      {price ? fmt(price.unit_amount ?? 0, price.currency) : fmt(book.priceCents ?? 0, "usd")}
                    </p>
                  </div>
                  <div>
                    <p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-mist">Orders</p>
                    <p className="mt-1 font-display text-xl font-medium text-ivory">{succeeded.length}</p>
                  </div>
                  <div>
                    <p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-mist">Revenue</p>
                    <p className="mt-1 font-display text-xl font-medium text-ivory">{fmt(totalRevenue, "usd")}</p>
                  </div>
                </div>
              </div>

              {/* IDs */}
              <div className="rounded border border-ivory/10 bg-ivory/5 px-5 py-3">
                <p className="font-sans text-xs text-mist">
                  Product: <code className="font-mono text-ivory">{book.stripeProductId}</code>
                  {price && <> · Price: <code className="font-mono text-ivory">{price.id}</code></>}
                </p>
              </div>

              {/* Orders table */}
              {orders.length === 0 ? (
                <p className="font-sans text-sm text-mist">No orders found for this product.</p>
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
                      {orders.map((pi) => (
                        <tr key={pi.id} className="hover:bg-ivory/5">
                          <td className="px-4 py-3 text-mist tabular-nums">{fmtDate(pi.created)}</td>
                          <td className="px-4 py-3 font-semibold text-ivory tabular-nums">{fmt(pi.amount, pi.currency)}</td>
                          <td className="px-4 py-3 text-ivory">{pi.latest_charge?.billing_details.name ?? "—"}</td>
                          <td className="px-4 py-3 text-mist">{pi.latest_charge?.billing_details.email ?? pi.receipt_email ?? "—"}</td>
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
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
