import { cacheLife } from "next/cache";
import Link from "next/link";
import { getNavigation, getSite, getSocialLinks, getHomeContent } from "@/lib/content";
import { Container } from "@/components/ui/container";
import { NewsletterForm } from "@/components/forms/newsletter-form";
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
  const { newsletter } = getHomeContent();

  return (
    <footer id="newsletter" className="scroll-mt-24 bg-espresso text-mist">
      <Container className="grid gap-8 py-10 sm:py-12 md:grid-cols-12 md:gap-2">
        {/* Brand */}
        <div className="md:col-span-3">
          <Wordmark tone="dark" />
          <p className="mt-4 max-w-xs font-display text-lg leading-snug text-ivory italic">
            {site.mission}
          </p>
          <a href={`mailto:${site.email}`} className="mt-3 inline-flex text-sm text-mist hover:text-ivory">
            {site.email}
          </a>
          {socials.length > 0 && (
            <ul className="mt-4 flex gap-1">
              {socials.map((social) => (
                <li key={social.platform}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="-ml-2.5 inline-flex size-10 items-center justify-center hover:text-ivory"
                  >
                    <SocialIcon platform={social.platform} className="size-5" />
                    <span className="sr-only">{social.label} (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Nav — three logical columns */}
        <nav aria-label="Footer" className="md:col-span-5 md:col-start-4 grid grid-cols-3 gap-6">
          <div>
            <h2 className="font-sans text-eyebrow font-semibold text-gold-light uppercase">Ministry</h2>
            <ul className="mt-4 grid gap-0 text-[0.875rem]">
              {[
                { label: "Home", href: "/" },
                { label: "About", href: "/about" },
                { label: "Ministry", href: "/ministry" },
                { label: "Events", href: "/events" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="inline-flex min-h-8 items-center hover:text-ivory">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-sans text-eyebrow font-semibold text-gold-light uppercase">Resources</h2>
            <ul className="mt-4 grid gap-0 text-[0.875rem]">
              {[
                { label: "Books", href: "/books" },
                { label: "Media", href: "/media" },
                { label: "Store", href: "/store" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="inline-flex min-h-8 items-center hover:text-ivory">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-sans text-eyebrow font-semibold text-gold-light uppercase">Connect</h2>
            <ul className="mt-4 grid gap-0 text-[0.875rem]">
              {[
                { label: "Contact", href: "/contact" },
                { label: "Partnerships", href: "/partnerships" },
                { label: "Give", href: "/donate" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="inline-flex min-h-8 items-center hover:text-ivory">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Newsletter */}
        <div className="md:col-span-4 md:col-start-9">
          <h2 className="font-sans text-eyebrow font-semibold text-gold-light uppercase">
            {newsletter.eyebrow}
          </h2>
          <p className="mt-3 text-sm text-mist">{newsletter.body}</p>
          <NewsletterForm className="mt-5" />
        </div>
      </Container>

      <div className="border-t border-ivory/10">
        <Container className="flex flex-col gap-3 py-5 text-[0.8125rem] sm:flex-row sm:items-center sm:justify-between px-0">
          <p>© <CopyrightYear /> {site.legalName}. All rights reserved.</p>
          <ul className="flex gap-6">
            {nav.legal.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="inline-flex min-h-8 items-center hover:text-ivory">
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
