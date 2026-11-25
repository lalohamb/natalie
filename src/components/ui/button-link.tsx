import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";

export type ButtonVariant = Variant;
type Variant = "primary" | "secondary" | "inverse" | "outline-inverse" | "text" | "text-inverse";

const base =
  "group inline-flex items-center justify-center gap-2.5 font-sans text-sm font-semibold tracking-[0.06em] uppercase transition-colors duration-300 ease-editorial";

const variants: Record<Variant, string> = {
  primary: "min-h-12 rounded-sm bg-ember px-7 text-ivory hover:bg-ember-deep",
  secondary:
    "min-h-12 rounded-sm border border-espresso/80 px-7 text-espresso hover:bg-espresso hover:text-ivory",
  inverse: "min-h-12 rounded-sm bg-ivory px-7 text-espresso hover:bg-linen",
  "outline-inverse":
    "min-h-12 rounded-sm border border-ivory/70 px-7 text-ivory hover:bg-ivory hover:text-espresso",
  text: "min-h-11 text-espresso underline decoration-gold decoration-1 underline-offset-[6px] hover:decoration-ember hover:text-ember",
  "text-inverse":
    "min-h-11 text-ivory underline decoration-gold-light decoration-1 underline-offset-[6px] hover:decoration-ivory",
};

type ButtonLinkProps = {
  href: string;
  variant?: Variant;
  /** Shows an arrow; external links get the up-right arrow automatically. */
  arrow?: boolean;
  className?: string;
  children: React.ReactNode;
  "aria-label"?: string;
};

/** Class names for a button in one of the site's variants — shared with real <button> elements. */
export const buttonClasses = (variant: Variant = "primary", className?: string) => cn(base, variants[variant], className);

const isExternal = (href: string) => /^https?:\/\//.test(href);

export function ButtonLink({
  href,
  variant = "primary",
  arrow = false,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  const external = isExternal(href);
  const classes = cn(base, variants[variant], className);
  const Icon = external ? ArrowUpRight : ArrowRight;
  const icon = (arrow || external) && (
    <Icon
      aria-hidden
      className="size-4 shrink-0 transition-transform duration-300 ease-editorial group-hover:translate-x-0.5"
      strokeWidth={1.75}
    />
  );

  if (external) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
        {icon}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {children}
      {icon}
    </Link>
  );
}
