import type { VideoCategory } from "@/content/types";

/* Shared presentational helpers for the admin dashboard (dark espresso theme). */

export const CATEGORY_LABELS: Record<VideoCategory, string> = {
  "ministry-message": "Ministry Message",
  "biblical-teaching": "Biblical Teaching",
  interview: "Interview",
  "personal-reflection": "Personal Reflection",
  "event-highlight": "Event Highlight",
};

export const adminButton = {
  primary:
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-sm bg-ember px-4 font-sans text-xs font-semibold tracking-[0.06em] text-ivory uppercase transition-colors hover:bg-ember-deep disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-light",
  secondary:
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-sm border border-ivory/25 px-4 font-sans text-xs font-semibold tracking-[0.06em] text-ivory uppercase transition-colors hover:bg-ivory/10 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-light",
  icon: "inline-flex size-9 items-center justify-center rounded-sm text-mist transition-colors hover:bg-ivory/10 hover:text-ivory disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-gold-light",
  danger:
    "inline-flex size-9 items-center justify-center rounded-sm text-mist transition-colors hover:bg-red-900/40 hover:text-red-300 disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-gold-light",
} as const;

export const adminInput =
  "w-full rounded-sm border border-ivory/20 bg-espresso px-3 py-2 font-sans text-sm text-ivory placeholder:text-mist/60 focus:border-gold-light focus:outline-none";

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-medium text-ivory">{title}</h1>
        {description && <p className="mt-1 font-sans text-sm text-mist">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function StatusPill({ tone, children }: { tone: "green" | "amber" | "gold" | "muted"; children: React.ReactNode }) {
  const tones = {
    green: "border-green-700/40 bg-green-900/40 text-green-300",
    amber: "border-amber-700/40 bg-amber-900/30 text-amber-300",
    gold: "border-gold/50 bg-gold/15 text-gold-light",
    muted: "border-ivory/15 bg-ivory/5 text-mist",
  };
  return (
    <span className={`inline-flex shrink-0 items-center rounded border px-2 py-0.5 font-sans text-[0.65rem] font-semibold tracking-wide uppercase ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(value >= 100 ? 0 : 1)} ${units[unit]}`;
}
