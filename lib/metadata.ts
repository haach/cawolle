import type { Metadata } from "next";
import { siteConfig } from "@/services/site";

const homeTitle = `${siteConfig.name} · Online-Wollgeschäft`;

const poster = {
  url: "/og.jpg",
  width: 1200,
  height: 630,
  alt: "Hände stricken mit hellem Garn, daneben eine bordeauxrote Mütze und Wollknäuel.",
};

export function shareMetadata({
  title,
  description,
  path,
  image,
}: {
  title?: string;
  description: string;
  path: string;
  image?: string;
}): Metadata {
  const pageTitle = title ? `${title} · ${siteConfig.name}` : homeTitle;
  const images = image ? [{ url: image, alt: pageTitle }] : [poster];

  return {
    title: title ?? { absolute: homeTitle },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "de_DE",
      siteName: siteConfig.name,
      title: pageTitle,
      description,
      url: new URL(path, siteConfig.url).toString(),
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: images.map((item) => item.url),
    },
  };
}
