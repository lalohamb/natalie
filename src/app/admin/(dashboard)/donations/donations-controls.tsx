"use client";

import { useActionState } from "react";
import { saveStripePaymentLink, type FormState } from "../../actions";
import { adminButton, adminInput } from "../../_components/admin-ui";

const initial: FormState = { status: "idle" };

export function PaymentLinkForm({ currentUrl }: { currentUrl: string }) {
  const [state, action, pending] = useActionState(saveStripePaymentLink, initial);

  return (
    <form action={action} className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <input
          name="url"
          type="url"
          defaultValue={currentUrl}
          required
          placeholder="https://donate.stripe.com/…"
          className={`${adminInput} max-w-lg flex-1`}
        />
        <button type="submit" disabled={pending} className={adminButton.primary}>
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
      {state.message && (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={`font-sans text-sm ${state.status === "error" ? "text-red-300" : "text-green-300"}`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
