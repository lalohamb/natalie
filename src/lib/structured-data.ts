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
      },
    ],
  };
}
