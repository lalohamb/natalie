"use client";

import { LoaderCircle } from "lucide-react";
import { useActionState, useId } from "react";
import { submitContact, type ContactState } from "@/app/actions/contact";
import { cn } from "@/lib/cn";

const initialState: ContactState = { status: "idle" };

const SUBJECTS = [
  { value: "booking", label: "Booking inquiry" },
  { value: "general", label: "General question" },
  { value: "other", label: "Other" },
] as const;

type ContactFormProps = {
  /** Pre-select a subject, e.g. "booking" when linked from the Events page. */
  defaultSubject?: "booking" | "general" | "other";
};

export function ContactForm({ defaultSubject = "general" }: ContactFormProps) {
  const [state, action, pending] = useActionState(submitContact, initialState);
  const id = useId();

  const fe = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  if (state.status === "success") {
    return (
      <div role="status" className="rounded-sm border border-sand bg-linen px-8 py-10">
        <p className="font-display text-display-sm font-medium text-espresso">
          {state.message}
        </p>
      </div>
    );
  }

  return (
    <form id="contact-form" action={action} noValidate className="flex flex-col gap-6">
      {/* Honeypot */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-hp`}>Leave this field empty</label>
        <input id={`${id}-hp`} name="nfm_hp" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          id={`${id}-name`}
          label="Full name"
          name="name"
          type="text"
          autoComplete="name"
          required
          error={fe.name}
        />
        <Field
          id={`${id}-email`}
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          required
          error={fe.email}
        />
      </div>

      <Field
        id={`${id}-organization`}
        label="Organization or ministry"
        name="organization"
        type="text"
        autoComplete="organization"
        hint="Optional"
        error={fe.organization}
      />

      {/* Subject */}
      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-subject`} className="font-sans text-sm font-semibold text-espresso">
          Subject <span aria-hidden className="text-ember">*</span>
        </label>
        <select
          id={`${id}-subject`}
          name="subject"
          required
          defaultValue={defaultSubject}
          aria-invalid={fe.subject ? true : undefined}
          className={cn(
            "h-12 rounded-sm border bg-ivory px-4 font-sans text-sm text-espresso focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember",
            fe.subject ? "border-ember" : "border-sand",
          )}
        >
          {SUBJECTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        {fe.subject && <p className="text-sm text-ember">{fe.subject}</p>}
      </div>

      {/* Message */}
      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-message`} className="font-sans text-sm font-semibold text-espresso">
          Message <span aria-hidden className="text-ember">*</span>
        </label>
        <textarea
          id={`${id}-message`}
          name="message"
          required
          rows={6}
          aria-invalid={fe.message ? true : undefined}
          className={cn(
            "rounded-sm border bg-ivory px-4 py-3 font-sans text-sm text-espresso focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember",
            fe.message ? "border-ember" : "border-sand",
          )}
        />
        {fe.message && <p className="text-sm text-ember">{fe.message}</p>}
      </div>

      {/* Form-level error */}
      {state.status === "error" && !Object.keys(fe).length && (
        <div role="alert" className="rounded-sm border border-sand bg-linen px-5 py-4">
          <p className="text-sm text-stone">{state.message}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-sm bg-ember font-sans text-sm font-semibold tracking-[0.06em] text-ivory uppercase transition-colors hover:bg-ember-deep focus-visible:outline-ember disabled:cursor-wait disabled:opacity-80 sm:w-auto sm:px-10"
      >
        {pending && <LoaderCircle aria-hidden className="size-4 animate-spin" />}
        {pending ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Shared field primitive
// ---------------------------------------------------------------------------
function Field({
  id,
  label,
  name,
  type,
  autoComplete,
  required,
  hint,
  error,
}: {
  id: string;
  label: string;
  name: string;
  type: string;
  autoComplete?: string;
  required?: boolean;
  hint?: string;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="font-sans text-sm font-semibold text-espresso">
        {label}
        {required && <span aria-hidden className="ml-1 text-ember">*</span>}
        {hint && <span className="ml-2 font-normal text-stone">({hint})</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={error ? true : undefined}
        className={cn(
          "h-12 rounded-sm border bg-ivory px-4 font-sans text-sm text-espresso focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember",
          error ? "border-ember" : "border-sand",
        )}
      />
      {error && <p className="text-sm text-ember">{error}</p>}
    </div>
  );
}
