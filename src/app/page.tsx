import type { Metadata } from "next";
import { BiographyPreview } from "@/components/sections/biography-preview";
import { DonationCTA } from "@/components/sections/donation-cta";
import { FeaturedMessage } from "@/components/sections/featured-message";
import { FeaturedPublications } from "@/components/sections/featured-publications";
import { HeroSection } from "@/components/sections/hero-section";
import { MinistryMessage } from "@/components/sections/ministry-message";
import { UpcomingEvents } from "@/components/sections/upcoming-events";
import { JsonLd } from "@/components/seo/json-ld";
import { getHomeContent, getSite } from "@/lib/content";
import { homeStructuredData } from "@/lib/structured-data";
import { getFeaturedVideo } from "@/lib/video-content";

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

export default async function HomePage() {
  const featuredVideo = await getFeaturedVideo();
  const { featuredMessage } = getHomeContent();

  return (
    <>
      <JsonLd data={homeStructuredData()} />

      {/* 1. Hero */}
      <HeroSection />

      {/* 2. Meet Natalie */}
      <BiographyPreview />

      {/* 3. Ministry Calling */}
      <MinistryMessage />

      {/* 4. Featured Message */}
      {featuredVideo && (
        <FeaturedMessage
          video={featuredVideo}
          eyebrow={featuredMessage.eyebrow}
          heading={featuredMessage.heading}
        />
      )}

      {/* 5. Featured Books */}
      <FeaturedPublications />

      {/* 6. Upcoming Events */}
      <UpcomingEvents />

      {/* 7. Partner With the Vision */}
      <DonationCTA />
    </>
  );
}
