"use client";

import { startTransition, useActionState, useState } from "react";
import { LogOut } from "lucide-react";
import type { CalendarListItem } from "@/lib/google-calendar";
import { selectCalendar, signOutGoogle, type FormState } from "../../actions";
import { adminButton, adminInput } from "../../_components/admin-ui";

const initial: FormState = { status: "idle" };

export function CalendarPicker({ calendars, selectedId }: { calendars: CalendarListItem[]; selectedId?: string }) {
  const [state, action, pending] = useActionState(selectCalendar, initial);
  const [value, setValue] = useState(selectedId ?? "");

  return (
    <form
      // Submit manually: a form `action` resets the select after saving.
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(() => action(formData));
      }}
      className="flex flex-col gap-3"
    >
      <label htmlFor="calendarId" className="font-sans text-xs font-semibold text-ivory">
        Calendar shown on the Events page
      </label>
      <div className="flex flex-wrap gap-2">
        <select
          id="calendarId"
          name="calendarId"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
          className={`${adminInput} max-w-md flex-1`}
        >
          <option value="" disabled>
            Choose a calendar…
          </option>
          {calendars.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
              {c.primary ? " (primary)" : ""}
            </option>
          ))}
        </select>
        <button type="submit" disabled={pending} className={adminButton.primary}>
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
      {state.message && (
        <p role={state.status === "error" ? "alert" : "status"} className={`font-sans text-sm ${state.status === "error" ? "text-red-300" : "text-green-300"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}

export function GoogleSignOutButton({ email }: { email: string }) {
  return (
    <form
      action={signOutGoogle}
      onSubmit={(e) => {
        if (!confirm(`Sign out ${email}? The Events page will stop showing Google Calendar events until you sign in again.`)) {
          e.preventDefault();
        }
      }}
    >
      <button type="submit" className={adminButton.secondary}>
        <LogOut aria-hidden className="size-4" strokeWidth={1.75} />
        Sign out of Google
      </button>
    </form>
  );
}
