import type { Metadata } from "next";
import { BiographyPreview } from "@/components/sections/biography-preview";
import { BookingCTA } from "@/components/sections/booking-cta";
import { DonationCTA } from "@/components/sections/donation-cta";
import { FeaturedPublications } from "@/components/sections/featured-publications";
import { HeroSection } from "@/components/sections/hero-section";
import { MinistryMessage } from "@/components/sections/ministry-message";
import { NewsletterSection } from "@/components/sections/newsletter-section";
import { JsonLd } from "@/components/seo/json-ld";
import { getSite } from "@/lib/content";
import { homeStructuredData } from "@/lib/structured-data";

const site = getSite();

export const metadata: Metadata = {
  title: { absolute: `${site.name} | ${site.tagline}` },
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    url: "/",
    title: `${site.name} | ${site.tagline}`,
    description: site.description,
  },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={homeStructuredData()} />
      <HeroSection />
      <BiographyPreview />
      <MinistryMessage />
      <FeaturedPublications />
      <BookingCTA />
      <DonationCTA />
      <NewsletterSection />
    </>
  );
}
