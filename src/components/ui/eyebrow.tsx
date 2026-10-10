import { cn } from "@/lib/cn";

type EyebrowProps = React.ComponentProps<"p"> & {
  tone?: "light" | "dark";
  rule?: boolean;
};

/** Small-caps label with a thin gold rule, used above section headings. */
export function Eyebrow({ tone = "light", rule = true, className, children, ...props }: EyebrowProps) {
  return (
    <p
      className={cn(
        "flex items-center gap-4 font-sans text-eyebrow font-semibold uppercase",
        tone === "light" ? "text-gold-ink" : "text-gold-light",
        className,
      )}
      {...props}
    >
      {rule && <span aria-hidden className="rule-gold" />}
      {children}
    </p>
  );
}
