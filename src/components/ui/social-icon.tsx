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
