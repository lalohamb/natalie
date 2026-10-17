import type { SocialLink } from "@/content/types";

/* Brand glyphs drawn inline — lucide-react no longer ships brand icons. */
const paths: Record<SocialLink["platform"], React.ReactNode> = {
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
  facebook: <path d="M14 8.5V7c0-.8.5-1.2 1.2-1.2H17V2.5h-2.8C11.4 2.5 10 4.3 10 6.9v1.6H7.5V12H10v9.5h4V12h2.8l.5-3.5H14Z" />,
  youtube: <path d="M22.5 6.5s-.2-1.6-.9-2.3c-.9-.9-1.9-.9-2.3-1C16.8 3 12 3 12 3s-4.8 0-7.3.2c-.4.1-1.4.1-2.3 1-.7.7-.9 2.3-.9 2.3S1.2 8.3 1.2 10v1.6c0 1.7.3 3.5.3 3.5s.2 1.6.9 2.3c.9.9 2 .9 2.5 1 1.8.2 7.1.2 7.1.2s4.8 0 7.3-.2c.4-.1 1.4-.1 2.3-1 .7-.7.9-2.3.9-2.3s.3-1.8.3-3.5V10c0-1.7-.3-3.5-.3-3.5ZM9.7 14.5V9l6.2 2.8-6.2 2.7Z" fill="currentColor" stroke="none" />,
};

export function SocialIcon({ platform, className }: { platform: SocialLink["platform"]; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {paths[platform]}
    </svg>
  );
}
