import type { Metadata } from "next";
import { BiographyPreview } from "@/components/sections/biography-preview";
import { BookingCTA } from "@/components/sections/booking-cta";
import { CoreValues } from "@/components/sections/core-values";
import { DonationCTA } from "@/components/sections/donation-cta";
import { FeaturedMessage } from "@/components/sections/featured-message";
import { FeaturedPublications } from "@/components/sections/featured-publications";
import { HeroSection } from "@/components/sections/hero-section";
import { MinistryMessage } from "@/components/sections/ministry-message";
import { NewsletterSection } from "@/components/sections/newsletter-section";
import { UpcomingEvents } from "@/components/sections/upcoming-events";
import { JsonLd } from "@/components/seo/json-ld";
import { getFeaturedVideo, getHomeContent, getSite } from "@/lib/content";
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
  const featuredVideo = getFeaturedVideo();
  const { featuredMessage } = getHomeContent();

  return (
    <>
      <JsonLd data={homeStructuredData()} />

      {/* 1. Hero */}
      <HeroSection />

      {/* 2. Meet Natalie */}
      <BiographyPreview />

      {/* 3. Ministry & Calling */}
      <MinistryMessage />

      {/* 4. Core Values — EQUIP · RESTORE · ACTIVATE */}
      <CoreValues />

      {/* 5. Featured Message — omitted gracefully when no video is published */}
      {featuredVideo && (
        <FeaturedMessage
          video={featuredVideo}
          eyebrow={featuredMessage.eyebrow}
          heading={featuredMessage.heading}
        />
      )}

      {/* 6. Featured Books */}
      <FeaturedPublications />

      {/* 7. Upcoming Events — omitted gracefully when schedule is empty */}
      <UpcomingEvents />

      {/* 8. Invite Natalie */}
      <BookingCTA />

      {/* 9. Partnership */}
      <DonationCTA />

      {/* 10. Newsletter */}
      <NewsletterSection />
    </>
  );
}
