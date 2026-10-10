import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Teach tailwind-merge the custom type scale from globals.css; otherwise
// `text-eyebrow` is mistaken for a text color and dropped beside `text-gold-ink`.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["eyebrow", "lede", "display-xl", "display-lg", "display-md", "display-sm"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
