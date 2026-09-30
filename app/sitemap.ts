import type { MetadataRoute } from "next";
import { readCatalog } from "@/lib/catalog";
import { footerNav, mainNav, siteConfig } from "@/services/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [...new Set([...mainNav, ...footerNav].map((item) => item.href))];
  const pages = paths.map((path) => ({
    url: new URL(path, siteConfig.url).toString(),
    changeFrequency: "monthly" as const,
    priority: path === "/" ? 1 : 0.7,
  }));

  const offers = readCatalog().offers.map((offer) => ({
    url: new URL(`/shop/${encodeURIComponent(offer.id)}`, siteConfig.url).toString(),
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  return [...pages, ...offers];
}
