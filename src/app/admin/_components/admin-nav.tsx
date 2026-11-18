"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const items = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/videos", label: "Videos" },
  { href: "/admin/files", label: "Files" },
  { href: "/admin/books", label: "Books" },
  { href: "/admin/calendar", label: "Calendar" },
  { href: "/admin/newsletter", label: "Newsletter" },
  { href: "/admin/donations", label: "Donations" },
  { href: "/admin/book-sales", label: "Book Sales" },
  { href: "/admin/integrations", label: "Integrations" },
] as const;

/** Active state comes from the URL, so this reads `usePathname()` behind a Suspense boundary. */
export function AdminNav() {
  return <NavList pathname={usePathname()} />;
}

/** Same links without an active state — the Suspense fallback for `AdminNav`. */
export function AdminNavFallback() {
  return <NavList pathname={null} />;
}

function NavList({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="Admin">
      <ul className="flex gap-1 overflow-x-auto" role="list">
        {items.map((item) => {
          const active =
            pathname !== null &&
            (item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href));
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-10 items-center rounded-sm px-3 font-sans text-[0.8125rem] font-semibold transition-colors",
                  active ? "bg-ivory/10 text-ivory" : "text-mist hover:bg-ivory/5 hover:text-ivory",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
