import type { MetadataRoute } from "next";
import { footerNav, mainNav, siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [...new Set([...mainNav, ...footerNav].map((item) => item.href))];

  return paths.map((path) => ({
    url: new URL(path, siteConfig.url).toString(),
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
