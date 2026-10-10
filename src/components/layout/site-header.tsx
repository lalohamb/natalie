import { getNavigation, getSite, getSocialLinks } from "@/lib/content";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { DesktopNavigation } from "./desktop-navigation";
import { MobileNavigation } from "./mobile-navigation";
import { Wordmark } from "./wordmark";

export function SiteHeader() {
  const nav = getNavigation();
  const site = getSite();

  return (
    <header className="sticky top-0 z-40 border-b border-sand/60 bg-ivory/92 backdrop-blur-md supports-[backdrop-filter]:bg-ivory/80">
      <Container className="flex h-20 items-center justify-between gap-8">
        <Wordmark />
        <div className="flex items-center gap-10">
          <DesktopNavigation items={nav.main} />
          <ButtonLink href={nav.give.href} className="hidden min-h-11 px-6 lg:inline-flex">
            {nav.give.label}
          </ButtonLink>
          <MobileNavigation items={nav.main} give={nav.give} socials={getSocialLinks()} email={site.email} />
        </div>
      </Container>
    </header>
  );
}
