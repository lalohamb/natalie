"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { adminInput, adminButton } from "./admin-ui";

type Option = { value: string; label: string };

export function TableFilters({
  q,
  status,
  book,
  statusOptions,
  bookOptions,
  searchPlaceholder,
}: {
  q: string;
  status: string;
  book?: string;
  statusOptions: Option[];
  bookOptions?: Option[];
  searchPlaceholder?: string;
}) {
  return (
    <form method="GET" className="flex flex-wrap items-center gap-2">
      {bookOptions && (
        <select name="book" value={book ?? ""} onChange={(e) => e.currentTarget.form?.requestSubmit()} className={`${adminInput} w-auto`}>
          <option value="">All books</option>
          {bookOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      )}
      <select name="status" value={status} onChange={(e) => e.currentTarget.form?.requestSubmit()} className={`${adminInput} w-auto`}>
        <option value="">All statuses</option>
        {statusOptions.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <input
        type="search"
        name="q"
        value={q}
        placeholder={searchPlaceholder ?? "Search…"}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className={`${adminInput} max-w-xs`}
      />
    </form>
  );
}

export function TablePagination({ page, totalPages }: { page: number; totalPages: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function go(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (p > 1) params.set("page", String(p));
    else params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center gap-2 font-sans text-sm">
      <button onClick={() => go(page - 1)} disabled={page <= 1} className={adminButton.secondary}>
        ← Prev
      </button>
      <span className="text-mist">{page} / {totalPages}</span>
      <button onClick={() => go(page + 1)} disabled={page >= totalPages} className={adminButton.secondary}>
        Next →
      </button>
    </div>
  );
}
