import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-espresso px-6 py-16">
      <div className="w-full max-w-sm rounded border border-ivory/10 bg-ivory/5 p-8">
        <p className="font-sans text-xs font-semibold text-gold-light uppercase tracking-[0.2em]">
          Natalie Flemons Ministries
        </p>
        <h1 className="mt-2 font-display text-3xl font-medium text-ivory">Admin sign in</h1>
        <LoginForm />
      </div>
    </div>
  );
}
