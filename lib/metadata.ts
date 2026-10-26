import type { Metadata } from "next";
import { headers } from "next/headers";
import { siteConfig } from "@/services/site";

const homeTitle = `${siteConfig.name} · Wolle und Garn`;

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
      url: path,
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

export async function rootMetadata(): Promise<Metadata> {
  const google = process.env.GOOGLE_SITE_VERIFICATION?.trim();

  return {
    metadataBase: await requestMetadataBase(),
    verification: google ? { google } : undefined,
    title: {
      default: homeTitle,
      template: `%s · ${siteConfig.name}`,
    },
    description: siteConfig.description,
    openGraph: {
      type: "website",
      locale: "de_DE",
      siteName: siteConfig.name,
      title: homeTitle,
      description: siteConfig.description,
      url: "/",
      images: [poster],
    },
    twitter: {
      card: "summary_large_image",
      title: homeTitle,
      description: siteConfig.description,
      images: [poster.url],
    },
  };
}

async function requestMetadataBase(): Promise<URL> {
  if (process.env.NODE_ENV === "production") return new URL(siteConfig.url);

  const headerList = await headers();
  const host = (headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "")
    .split(",")[0]
    ?.trim();

  if (!host || !/^[A-Za-z0-9.-]+(?::\d+)?$/.test(host)) return new URL(siteConfig.url);

  const forwardedProto = headerList.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol =
    forwardedProto === "http" || forwardedProto === "https"
      ? forwardedProto
      : host.startsWith("localhost") || host.startsWith("127.0.0.1")
        ? "http"
        : "https";

  return new URL(`${protocol}://${host}`);
}
