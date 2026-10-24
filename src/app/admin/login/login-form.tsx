"use client";

import { useActionState } from "react";
import { login, type FormState } from "../actions";
import { adminButton, adminInput } from "../_components/admin-ui";

const initial: FormState = { status: "idle" };

export function LoginForm() {
  const [state, action, pending] = useActionState(login, initial);

  return (
    <form action={action} className="mt-6 flex flex-col gap-4">
      <div>
        <label htmlFor="admin-password" className="mb-1.5 block font-sans text-xs font-semibold text-ivory">
          Password
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={adminInput}
          aria-describedby={state.message ? "login-error" : undefined}
        />
      </div>
      {state.status === "error" && (
        <p id="login-error" role="alert" className="font-sans text-sm text-red-300">
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className={adminButton.primary}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
