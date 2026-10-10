import Link from "next/link";
import { cn } from "@/lib/cn";

type WordmarkProps = {
  tone?: "light" | "dark";
  className?: string;
};

/** Text wordmark. Replaces the legacy yellow monogram pending a refined logo. */
export function Wordmark({ tone = "light", className }: WordmarkProps) {
  return (
    <Link
      href="/"
      aria-label="Natalie Flemons Ministries — home"
      className={cn("group inline-flex flex-col leading-none", className)}
    >
      <span
        className={cn(
          "font-display text-[1.65rem] font-medium tracking-[-0.01em] sm:text-[1.85rem]",
          tone === "light" ? "text-espresso" : "text-ivory",
        )}
      >
        Natalie Flemons
      </span>
      <span
        className={cn(
          "mt-1 flex items-center gap-2 font-sans text-[0.625rem] font-semibold tracking-[0.42em] uppercase",
          tone === "light" ? "text-gold-ink" : "text-gold-light",
        )}
      >
        Ministries
      </span>
    </Link>
  );
}
