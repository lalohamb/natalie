import type { MetadataRoute } from "next";
import { getEvents, getSite } from "@/lib/content";
import { getPublishedBooks } from "@/lib/book-content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { url } = getSite();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${url}/`, priority: 1.0, changeFrequency: "weekly" },
    { url: `${url}/about`, priority: 0.9, changeFrequency: "monthly" },
    { url: `${url}/ministry`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${url}/books`, priority: 0.9, changeFrequency: "monthly" },
    { url: `${url}/events`, priority: 0.8, changeFrequency: "weekly" },
    { url: `${url}/media`, priority: 0.7, changeFrequency: "weekly" },
    { url: `${url}/partnerships`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${url}/contact`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${url}/privacy`, priority: 0.3, changeFrequency: "yearly" },
    { url: `${url}/terms`, priority: 0.3, changeFrequency: "yearly" },
  ];

  const bookRoutes: MetadataRoute.Sitemap = (await getPublishedBooks()).map((book) => ({
    url: `${url}/books/${book.slug}`,
    priority: 0.8,
    changeFrequency: "monthly" as const,
  }));

  const eventRoutes: MetadataRoute.Sitemap = getEvents().map((event) => ({
    url: `${url}/events/${event.slug}`,
    priority: 0.7,
    changeFrequency: "weekly" as const,
  }));

  return [...staticRoutes, ...bookRoutes, ...eventRoutes];
}
