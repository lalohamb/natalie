import { cacheLife } from "next/cache";
import Link from "next/link";
import { getNavigation, getSite, getSocialLinks } from "@/lib/content";
import { Container } from "@/components/ui/container";
import { SocialIcon } from "@/components/ui/social-icon";
import { Wordmark } from "./wordmark";

async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

export function SiteFooter() {
  const site = getSite();
  const nav = getNavigation();
  const socials = getSocialLinks();

  return (
    <footer className="bg-espresso text-mist">
      <Container className="grid gap-14 py-20 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5">
          <Wordmark tone="dark" />
          <p className="mt-8 max-w-xs font-display text-2xl leading-snug text-ivory italic">
            {site.mission}
          </p>
        </div>

        <nav aria-label="Footer" className="md:col-span-3">
          <h2 className="font-sans text-eyebrow font-semibold text-gold-light uppercase">Explore</h2>
          <ul className="mt-6 grid grid-cols-2 gap-x-8 gap-y-1 text-[0.9375rem] md:grid-cols-1">
            {[{ label: "Home", href: "/" }, ...nav.main, { label: "Give", href: nav.give.href }].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="inline-flex min-h-10 items-center hover:text-ivory">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-4">
          <h2 className="font-sans text-eyebrow font-semibold text-gold-light uppercase">Connect</h2>
          <ul className="mt-6 grid gap-1 text-[0.9375rem]">
            <li>
              <a href={`mailto:${site.email}`} className="inline-flex min-h-10 items-center hover:text-ivory">
                {site.email}
              </a>
            </li>
            <li>
              <Link href="/#newsletter" className="inline-flex min-h-10 items-center hover:text-ivory">
                Newsletter sign-up
              </Link>
            </li>
          </ul>
          {socials.length > 0 && (
            <ul className="mt-4 flex gap-1">
              {socials.map((social) => (
                <li key={social.platform}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="-ml-2.5 inline-flex size-11 items-center justify-center hover:text-ivory"
                  >
                    <SocialIcon platform={social.platform} className="size-5" />
                    <span className="sr-only">{social.label} (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>

      <div className="border-t border-ivory/10">
        <Container className="flex flex-col gap-4 py-8 text-[0.8125rem] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CopyrightYear /> {site.legalName}. All rights reserved.
          </p>
          <ul className="flex gap-6">
            {nav.legal.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="inline-flex min-h-10 items-center hover:text-ivory">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </footer>
  );
}
