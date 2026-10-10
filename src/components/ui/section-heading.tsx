import { cn } from "@/lib/cn";
import { Eyebrow } from "./eyebrow";

type SectionHeadingProps = {
  eyebrow?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  as?: "h1" | "h2" | "h3";
  tone?: "light" | "dark";
  align?: "start" | "center";
  size?: "lg" | "md";
  id?: string;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  lede,
  as: Heading = "h2",
  tone = "light",
  align = "start",
  size = "lg",
  id,
  className,
}: SectionHeadingProps) {
  const centered = align === "center";
  return (
    <div className={cn("flex flex-col gap-6", centered && "items-center text-center", className)}>
      {eyebrow && (
        <Eyebrow tone={tone} className={cn(centered && "justify-center")}>
          {eyebrow}
        </Eyebrow>
      )}
      <Heading
        id={id}
        className={cn(
          "font-display font-medium text-balance",
          size === "lg" ? "text-display-lg" : "text-display-md",
          tone === "light" ? "text-espresso" : "text-ivory",
        )}
      >
        {title}
      </Heading>
      {lede && (
        <p
          className={cn(
            "max-w-prose text-lede text-pretty",
            tone === "light" ? "text-stone" : "text-mist",
          )}
        >
          {lede}
        </p>
      )}
    </div>
  );
}
