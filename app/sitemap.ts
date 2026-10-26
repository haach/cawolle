import type { MetadataRoute } from "next";
import { readCatalog } from "@/lib/catalog";
import { indexableCategories } from "@/lib/categories";
import { footerNav, mainNav, siteConfig } from "@/services/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const catalog = readCatalog();
  const paths = [
    ...new Set([
      ...mainNav.map((item) => item.href),
      ...footerNav.map((item) => item.href),
      ...indexableCategories(catalog.offers).map((page) => page.path),
    ]),
  ];
  const pages = paths.map((path) => ({
    url: new URL(path, siteConfig.url).toString(),
    changeFrequency: "monthly" as const,
    priority: path === "/" ? 1 : 0.7,
  }));

  const offers = catalog.offers.map((offer) => ({
    url: new URL(`/shop/${encodeURIComponent(offer.id)}`, siteConfig.url).toString(),
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  return [...pages, ...offers];
}
