import type { AdminBook, Book, MinistryEvent } from "@/content/types";
import { getBio, getSite, getSocialLinks } from "./content";

const site = getSite();
const organizationId = `${site.url}/#organization`;
const personId = `${site.url}/#natalie-flemons`;

/** Person + Organization + WebSite graph for the homepage. */
export function homeStructuredData() {
  const bio = getBio();
  const sameAs = getSocialLinks().map((link) => link.href);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: site.name,
        legalName: site.legalName,
        url: site.url,
        email: site.email,
        founder: { "@id": personId },
        sameAs,
      },
      {
        "@type": "Person",
        "@id": personId,
        name: bio.name,
        url: `${site.url}/about`,
        jobTitle: "Founder, Natalie Flemons Ministries",
        worksFor: { "@id": organizationId },
        sameAs,
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        name: site.name,
        url: site.url,
        publisher: { "@id": organizationId },
        inLanguage: "en-US",
        // GEO: speakable tells AI crawlers which text best represents the page
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["h1", "[data-speakable]"],
        },
      },
    ],
  };
}

/** Full Person graph for the /about page — richer for AI citation. */
export function personStructuredData() {
  const bio = getBio();
  const sameAs = getSocialLinks().map((link) => link.href);

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": personId,
    name: bio.name,
    url: `${site.url}/about`,
    description: bio.short,
    jobTitle: bio.identityLine,
    worksFor: { "@id": organizationId, "@type": "Organization", name: site.name },
    sameAs,
    knowsAbout: [
      "Prophetic Ministry",
      "Intercessory Prayer",
      "Spiritual Formation",
      "Christian Leadership",
      "Destiny Coaching",
    ],
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "[data-speakable]"],
    },
  };
}

/** Book / Product schema for individual book pages. */
export function bookStructuredData(book: Book | AdminBook) {
  // Where a buyer goes to purchase: the external retailer, or this site's own
  // book page (checkout starts from a button there — it has no linkable URL).
  const purchaseUrl =
    book.purchase.kind === "external"
      ? book.purchase.url || undefined
      : book.purchase.kind === "stripe-checkout" && book.purchase.priceId
        ? `${site.url}/books/${book.slug}`
        : undefined;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    ...(book.subtitle ? { alternativeHeadline: book.subtitle } : {}),
    description: book.summary,
    author: { "@id": personId, "@type": "Person", name: "Natalie C. Flemons" },
    publisher: { "@id": organizationId, "@type": "Organization", name: site.name },
    url: `${site.url}/books/${book.slug}`,
    inLanguage: "en-US",
    ...(book.forewordBy ? { contributor: { "@type": "Person", name: book.forewordBy } } : {}),
  };

  if (book.status === "published" && book.priceCents !== undefined && purchaseUrl) {
    schema.offers = {
      "@type": "Offer",
      price: (book.priceCents / 100).toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: purchaseUrl,
      seller: { "@id": organizationId },
    };
  }

  return schema;
}

/** Event schema for individual event pages. */
export function eventStructuredData(event: MinistryEvent) {
  const location = [event.venue, event.city, event.state, event.country].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: event.startDate,
    ...(event.endDate ? { endDate: event.endDate } : {}),
    eventStatus:
      event.status === "cancelled"
        ? "https://schema.org/EventCancelled"
        : event.status === "postponed"
          ? "https://schema.org/EventPostponed"
          : "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    organizer: { "@id": organizationId, "@type": "Organization", name: site.name },
    performer: { "@id": personId, "@type": "Person", name: "Natalie C. Flemons" },
    url: `${site.url}/events/${event.slug}`,
    ...(location.length
      ? {
          location: {
            "@type": "Place",
            name: event.venue ?? location[0],
            address: {
              "@type": "PostalAddress",
              ...(event.city ? { addressLocality: event.city } : {}),
              ...(event.state ? { addressRegion: event.state } : {}),
              ...(event.country ? { addressCountry: event.country } : {}),
            },
          },
        }
      : {}),
    ...(event.registrationUrl ? { offers: { "@type": "Offer", url: event.registrationUrl, price: "0", priceCurrency: "USD" } } : {}),
  };
}
