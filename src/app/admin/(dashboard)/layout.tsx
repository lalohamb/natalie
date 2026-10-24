import type { Metadata } from "next";
import { Suspense } from "react";
import { LogOut } from "lucide-react";
import { logout } from "../actions";
import { AdminNav, AdminNavFallback } from "../_components/admin-nav";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

export default function AdminDashboardLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="min-h-screen bg-espresso text-mist">
      <div className="border-b border-ivory/10 px-6 py-4 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-sans text-xs font-semibold text-gold-light uppercase tracking-[0.2em]">
              Natalie Flemons Ministries
            </p>
            <p className="mt-0.5 font-display text-xl font-medium text-ivory">Admin Dashboard</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="inline-flex min-h-10 items-center gap-2 rounded-sm px-3 font-sans text-xs font-semibold text-mist transition-colors hover:bg-ivory/10 hover:text-ivory"
            >
              <LogOut aria-hidden className="size-4" strokeWidth={1.75} />
              Sign out
            </button>
          </form>
        </div>
        <div className="mx-auto mt-4 max-w-6xl">
          <Suspense fallback={<AdminNavFallback />}>
            <AdminNav />
          </Suspense>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10 sm:px-8">
        {/* Pages read the session cookie, so they stream in behind this boundary. */}
        <Suspense fallback={<p className="font-sans text-sm text-mist">Loading…</p>}>{children}</Suspense>
      </div>
    </div>
  );
}
