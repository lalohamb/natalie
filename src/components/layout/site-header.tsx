import { getNavigation, getSite, getSocialLinks } from "@/lib/content";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { DesktopNavigation } from "./desktop-navigation";
import { MedallionResponsive } from "./medallion-responsive";
import { MobileNavigation } from "./mobile-navigation";
import { Wordmark } from "./wordmark";

export function SiteHeader() {
  const nav = getNavigation();
  const site = getSite();

  return (
    <header className="sticky top-0 z-40 border-b border-sand/60 bg-ivory/95 backdrop-blur-sm transition-shadow duration-300 supports-[backdrop-filter]:bg-ivory/85">
      {/* Medallion — absolutely pinned to far left, overflows header height */}
      <div className="absolute left-0 top-1/2 -translate-y-1/3 z-50">
        <MedallionResponsive />
      </div>
      <Container className="flex h-16 items-center justify-between gap-6 sm:h-20">
        <div className="flex items-center pl-[76px] lg:pl-[13px]">
          <Wordmark />
        </div>
        <div className="flex items-center gap-6 lg:gap-10">
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
