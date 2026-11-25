"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useReducer, useState } from "react";
import type { AdminBook } from "@/content/types";
import type { MediaFile } from "@/lib/media-store";
import type { StripePrice, StripeProduct } from "@/lib/stripe";
import { BOOK_CATEGORIES, BOOK_STATUSES } from "@/content/book-constants";
import { saveBook, getStripeProductsForPicker, type FormState } from "../../actions";
import { adminButton, adminInput } from "../../_components/admin-ui";
import { FileUploader } from "../../_components/file-uploader";

const initial: FormState = { status: "idle" };

const CATEGORY_LABELS: Record<string, string> = {
  prophetic: "Prophetic",
  destiny: "Destiny",
  warfare: "Warfare",
  autobiography: "Autobiography",
};

const STATUS_LABELS: Record<string, string> = {
  published: "Published",
  forthcoming: "Forthcoming",
  unavailable: "Unavailable",
};

export function BookForm({ book, files: initialFiles }: { book?: AdminBook; files: MediaFile[] }) {
  const [state, action, pending] = useActionState(saveBook.bind(null, book?.slug ?? null), initial);
  const [files, setFiles] = useState(initialFiles);
  const [coverUrl, setCoverUrl] = useState(book?.coverUrl ?? "");
  const [purchaseKind, setPurchaseKind] = useState<"none" | "external" | "stripe-checkout">(
    book?.purchase.kind ?? "none",
  );

  const initialProductId = book?.stripeProductId ?? "";
  const initialPriceId = book?.purchase.kind === "stripe-checkout" ? book.purchase.priceId : "";

  type StripeState = {
    products: StripeProduct[];
    prices: StripePrice[];
    selectedProductId: string;
    selectedPriceId: string;
    loading: boolean;
    error: string | null;
  };
  type StripeAction =
    | { type: "loading" }
    | { type: "products_loaded"; products: StripeProduct[]; prices: StripePrice[] }
    | { type: "prices_loaded"; prices: StripePrice[]; productId: string }
    | { type: "select_price"; priceId: string }
    | { type: "clear_product" }
    | { type: "error"; message: string };

  const [stripe, dispatchStripe] = useReducer(
    (s: StripeState, a: StripeAction): StripeState => {
      switch (a.type) {
        case "loading": return { ...s, loading: true, error: null };
        case "products_loaded": return { ...s, loading: false, products: a.products, prices: a.prices, error: null };
        case "prices_loaded": return { ...s, loading: false, prices: a.prices, selectedProductId: a.productId, selectedPriceId: "", error: null };
        case "select_price": return { ...s, selectedPriceId: a.priceId };
        case "clear_product": return { ...s, prices: [], selectedProductId: "", selectedPriceId: "", error: null };
        case "error": return { ...s, loading: false, error: a.message };
      }
    },
    { products: [], prices: [], selectedProductId: initialProductId, selectedPriceId: initialPriceId, loading: false, error: null },
  );

  useEffect(() => {
    if (purchaseKind !== "stripe-checkout") return;
    dispatchStripe({ type: "loading" });
    getStripeProductsForPicker(initialProductId || undefined)
      .then(({ products, prices }) => dispatchStripe({ type: "products_loaded", products, prices }))
      .catch((err: unknown) => dispatchStripe({ type: "error", message: String(err instanceof Error ? err.message : err) }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purchaseKind]);

  const onProductChange = (productId: string) => {
    if (!productId) { dispatchStripe({ type: "clear_product" }); return; }
    dispatchStripe({ type: "loading" });
    getStripeProductsForPicker(productId)
      .then(({ prices }) => dispatchStripe({ type: "prices_loaded", prices, productId }))
      .catch((err: unknown) => dispatchStripe({ type: "error", message: String(err instanceof Error ? err.message : err) }));
  };

  useEffect(() => {
    if (state.status !== "success") return;
    const t = setTimeout(() => { window.location.href = "/admin/books"; }, 1200);
    return () => clearTimeout(t);
  }, [state.status]);

  const imageFiles = files.filter((f) => f.kind === "image");
  const errors = state.fieldErrors ?? {};

  const onUploaded = (file: MediaFile) => {
    setFiles((prev) => [file, ...prev.filter((f) => f.url !== file.url)]);
    if (file.kind === "image") setCoverUrl(file.url);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(() => action(formData));
      }}
      className="flex flex-col gap-6 max-w-2xl"
      noValidate
    >
      {state.status === "error" && state.message && (
        <p role="alert" className="rounded border border-red-800/50 bg-red-950/40 px-4 py-3 font-sans text-sm text-red-300">
          {state.message}
        </p>
      )}
      {state.status === "success" && state.message && (
        <p role="status" className="rounded border border-green-800/50 bg-green-950/40 px-4 py-3 font-sans text-sm text-green-300">
          {state.message} <Link href="/admin/books" className="underline underline-offset-4 hover:text-ivory">Back to books →</Link>
        </p>
      )}

      <Field label="Title" htmlFor="title" error={errors.title}>
        <input id="title" name="title" defaultValue={book?.title} required maxLength={160} className={adminInput} />
      </Field>

      <Field label="Subtitle" htmlFor="subtitle" hint="Optional.">
        <input id="subtitle" name="subtitle" defaultValue={book?.subtitle} maxLength={200} className={adminInput} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Status" htmlFor="status" error={errors.status}>
          <select id="status" name="status" defaultValue={book?.status ?? "published"} className={adminInput}>
            {BOOK_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </Field>

        <Field label="Price (cents)" htmlFor="priceCents" hint="e.g. 1499 for $14.99. Leave blank if not sold here. With Stripe Checkout this must match the Stripe price — leave blank to fill it in from Stripe.">
          <input id="priceCents" name="priceCents" type="number" min={0} defaultValue={book?.priceCents} className={adminInput} />
        </Field>
      </div>

      <Field label="Category" htmlFor="category">
        <select id="category" name="category" defaultValue={book?.category ?? ""} className={adminInput}>
          <option value="">None</option>
          {BOOK_CATEGORIES.map((c) => (
            <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
          ))}
        </select>
      </Field>

      <Field label="Summary" htmlFor="summary" hint="1–2 sentences shown on cards." error={errors.summary}>
        <textarea id="summary" name="summary" defaultValue={book?.summary} rows={2} maxLength={500} className={adminInput} />
      </Field>

      <Field label="Description" htmlFor="description" hint="Full description. Separate paragraphs with a blank line." error={errors.description}>
        <textarea id="description" name="description" defaultValue={book?.description.join("\n\n")} rows={8} className={adminInput} />
      </Field>

      <Field label="Foreword by" htmlFor="forewordBy" hint="Optional.">
        <input id="forewordBy" name="forewordBy" defaultValue={book?.forewordBy} maxLength={100} className={adminInput} />
      </Field>

      <Field label="Note" htmlFor="note" hint="Optional. Shown as a callout on the book detail page.">
        <input id="note" name="note" defaultValue={book?.note} maxLength={500} className={adminInput} />
      </Field>

      <Field label="Companion of (slug)" htmlFor="companionOf" hint="Optional. Slug of the parent book if this is a workbook.">
        <input id="companionOf" name="companionOf" defaultValue={book?.companionOf} className={adminInput} />
      </Field>

      {/* Cover image */}
      <fieldset className="rounded border border-ivory/10 p-5">
        <legend className="px-1 font-sans text-xs font-semibold text-ivory">Cover image</legend>
        <div className="flex flex-col gap-4">
          <Field label="Cover image URL" htmlFor="coverUrl" hint="Choose an uploaded image or paste a URL.">
            <div className="flex gap-2">
              <select
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className={`${adminInput} flex-1`}
              >
                <option value="">No cover (shows placeholder)</option>
                {imageFiles.map((f) => (
                  <option key={f.url} value={f.url}>{f.name}</option>
                ))}
              </select>
            </div>
            <input type="hidden" name="coverUrl" value={coverUrl} />
          </Field>

          {coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} alt="Cover preview" className="h-32 w-auto rounded border border-ivory/10 object-cover" />
          )}

          <Field label="Cover alt text" htmlFor="coverAlt" hint="Describe the cover for screen readers.">
            <input id="coverAlt" name="coverAlt" defaultValue={book?.coverAlt} maxLength={300} className={adminInput} />
          </Field>

          <div>
            <p className="mb-2 font-sans text-xs font-semibold text-ivory">Upload a new cover</p>
            <FileUploader compact onUploaded={onUploaded} />
          </div>
        </div>
      </fieldset>

      {/* Purchase */}
      <fieldset className="rounded border border-ivory/10 p-5">
        <legend className="px-1 font-sans text-xs font-semibold text-ivory">Purchase</legend>
        <div className="flex flex-wrap gap-4 mb-4">
          {(["none", "external", "stripe-checkout"] as const).map((kind) => (
            <label key={kind} className="flex items-center gap-2 font-sans text-sm text-ivory">
              <input
                type="radio"
                name="purchaseKind"
                value={kind}
                checked={purchaseKind === kind}
                onChange={() => setPurchaseKind(kind)}
                className="accent-gold-light"
              />
              {kind === "none" ? "No purchase button" : kind === "external" ? "External URL" : "Stripe Checkout"}
            </label>
          ))}
        </div>

        {purchaseKind !== "none" && (
          <div className="flex flex-col gap-4">
            {purchaseKind === "external" && (
              <Field label="Purchase URL" htmlFor="purchaseUrl">
                <input
                  id="purchaseUrl"
                  name="purchaseUrl"
                  type="url"
                  defaultValue={book?.purchase.kind === "external" ? book.purchase.url : ""}
                  className={adminInput}
                />
              </Field>
            )}
            {purchaseKind === "stripe-checkout" && (
              <>
                <Field label="Stripe Product" htmlFor="stripeProductPicker" hint={stripe.loading ? "Loading…" : stripe.error ? undefined : stripe.products.length === 0 ? "No active Stripe products found. Check STRIPE_SECRET_KEY." : undefined} error={stripe.error ?? undefined}>
                  <select
                    id="stripeProductPicker"
                    value={stripe.selectedProductId}
                    onChange={(e) => onProductChange(e.target.value)}
                    disabled={stripe.loading}
                    className={adminInput}
                  >
                    <option value="">— choose a product —</option>
                    {stripe.products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <input type="hidden" name="stripeProductId" value={stripe.selectedProductId} />
                </Field>
                <Field label="Stripe Price" htmlFor="purchasePriceId" hint={stripe.selectedProductId && stripe.prices.length === 0 && !stripe.loading ? "No active prices for this product." : undefined}>
                  <select
                    id="purchasePriceId"
                    value={stripe.selectedPriceId}
                    onChange={(e) => dispatchStripe({ type: "select_price", priceId: e.target.value })}
                    disabled={stripe.loading || !stripe.selectedProductId}
                    className={adminInput}
                  >
                    <option value="">— choose a price —</option>
                    {stripe.prices.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nickname ? `${p.nickname} — ` : ""}{p.unit_amount !== null ? `$${(p.unit_amount / 100).toFixed(2)} ${p.currency.toUpperCase()}` : "variable"} ({p.id})
                      </option>
                    ))}
                  </select>
                  <input type="hidden" name="purchasePriceId" value={stripe.selectedPriceId} />
                </Field>
              </>
            )}
            <Field label="Button label" htmlFor="purchaseLabel" hint='Defaults to "Purchase".'>
              <input
                id="purchaseLabel"
                name="purchaseLabel"
                defaultValue={book?.purchase.kind !== "none" ? book?.purchase.label : ""}
                placeholder="Purchase"
                maxLength={60}
                className={adminInput}
              />
            </Field>
          </div>
        )}
      </fieldset>

      {/* Stripe product ID for non-checkout books (sales tracking only) */}
      {purchaseKind !== "stripe-checkout" && (
        <Field label="Stripe Product ID" htmlFor="stripeProductId" hint="Optional. Links this book to a Stripe product for sales tracking.">
          <input id="stripeProductId" name="stripeProductId" defaultValue={book?.stripeProductId} className={adminInput} />
        </Field>
      )}

      <div className="flex flex-col gap-3">
        <Checkbox name="featured" label="Featured — shown on homepage and books page highlights" defaultChecked={book?.featured ?? false} />
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className={adminButton.primary}>
          {pending ? "Saving…" : book ? "Save changes" : "Add book"}
        </button>
        <Link href="/admin/books" className={adminButton.secondary}>Cancel</Link>
      </div>
    </form>
  );
}

function Field({ label, htmlFor, hint, error, children }: { label: string; htmlFor: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block font-sans text-xs font-semibold text-ivory">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 font-sans text-xs text-mist">{hint}</p>}
      {error && <p className="mt-1 font-sans text-xs text-red-300" role="alert">{error}</p>}
    </div>
  );
}

function Checkbox({ name, label, defaultChecked }: { name: string; label: string; defaultChecked: boolean }) {
  return (
    <label className="flex items-start gap-2.5 font-sans text-sm text-ivory">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 size-4 accent-gold-light" />
      {label}
    </label>
  );
}
