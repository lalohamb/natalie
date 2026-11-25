import type { MetadataRoute } from "next";
import { getEvents, getSite } from "@/lib/content";
import { getPublishedBooks } from "@/lib/book-content";

const now = new Date();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { url } = getSite();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${url}/`, priority: 1.0, changeFrequency: "weekly", lastModified: now },
    { url: `${url}/about`, priority: 0.9, changeFrequency: "monthly", lastModified: now },
    { url: `${url}/ministry`, priority: 0.8, changeFrequency: "monthly", lastModified: now },
    { url: `${url}/books`, priority: 0.9, changeFrequency: "monthly", lastModified: now },
    { url: `${url}/events`, priority: 0.8, changeFrequency: "weekly", lastModified: now },
    { url: `${url}/media`, priority: 0.7, changeFrequency: "weekly", lastModified: now },
    { url: `${url}/partnerships`, priority: 0.7, changeFrequency: "monthly", lastModified: now },
    { url: `${url}/contact`, priority: 0.7, changeFrequency: "monthly", lastModified: now },
    { url: `${url}/privacy`, priority: 0.3, changeFrequency: "yearly", lastModified: now },
    { url: `${url}/terms`, priority: 0.3, changeFrequency: "yearly", lastModified: now },
  ];

  const bookRoutes: MetadataRoute.Sitemap = (await getPublishedBooks()).map((book) => ({
    url: `${url}/books/${book.slug}`,
    priority: 0.8,
    changeFrequency: "monthly" as const,
    lastModified: now,
  }));

  const eventRoutes: MetadataRoute.Sitemap = getEvents().map((event) => ({
    url: `${url}/events/${event.slug}`,
    priority: 0.7,
    changeFrequency: "weekly" as const,
    lastModified: new Date(event.updatedAt),
  }));

  return [...staticRoutes, ...bookRoutes, ...eventRoutes];
}
