"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

const items = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/about", label: "About" },
  { href: "/admin/legal", label: "Legal" },
  { href: "/admin/videos", label: "Videos" },
  { href: "/admin/files", label: "Files" },
  { href: "/admin/books", label: "Books" },
  { href: "/admin/courses", label: "Equipping Academy" },
  { href: "/admin/calendar", label: "Calendar" },
  { href: "/admin/newsletter", label: "Newsletter" },
  { href: "/admin/donations", label: "Donations" },
  { href: "/admin/book-sales", label: "Book Sales" },
  { href: "/admin/integrations", label: "Integrations" },
] as const;

/** Active state comes from the URL, so this reads `usePathname()` behind a Suspense boundary. */
export function AdminNav() {
  const pathname = usePathname();
  const [navigating, setNavigating] = useState(false);
  const prev = useRef(pathname);

  useEffect(() => {
    if (pathname !== prev.current) {
      setNavigating(false);
      prev.current = pathname;
    }
  }, [pathname]);

  return (
    <>
      <NavList pathname={pathname} onNavigate={() => setNavigating(true)} />
      {navigating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/60 backdrop-blur-sm">
          <div className="size-8 animate-spin rounded-full border-2 border-ivory/20 border-t-ivory" />
        </div>
      )}
    </>
  );
}

/** Same links without an active state — the Suspense fallback for `AdminNav`. */
export function AdminNavFallback() {
  return <NavList pathname={null} />;
}

function NavList({ pathname, onNavigate }: { pathname: string | null; onNavigate?: () => void }) {
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
                onClick={() => !active && onNavigate?.()}
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
