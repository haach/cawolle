import type {
  BreadcrumbList,
  CollectionPage,
  ContactPage,
  Offer,
  OnlineStore,
  Product,
  Thing,
  WebSite,
  WithContext,
} from "schema-dts";
import { pageTitle, type NormalizedOffer } from "@/lib/normalize";
import type { OfferDetail } from "@/lib/shop";
import { siteConfig } from "@/services/site";

const organizationId = `${siteConfig.url}/#organization`;

export function absoluteUrl(path: string) {
  return new URL(path, siteConfig.url).toString();
}

export function organization(details?: {
  address?: boolean;
  email?: boolean;
  sameAs?: string;
}): WithContext<OnlineStore> {
  return {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "@id": organizationId,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    logo: absoluteUrl(siteConfig.logo),
    email: details?.email ? siteConfig.email : undefined,
    sameAs: details?.sameAs,
    address: details?.address
      ? {
          "@type": "PostalAddress",
          streetAddress: siteConfig.address.street,
          postalCode: siteConfig.address.postalCode,
          addressLocality: siteConfig.address.locality,
          addressCountry: siteConfig.address.country,
        }
      : undefined,
  };
}

export function website(): WithContext<WebSite> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: "de",
    publisher: { "@id": organizationId },
  };
}

export function breadcrumb(items: { name: string; path: string }[]): WithContext<BreadcrumbList> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function shopPage(): WithContext<CollectionPage> {
  return collectionPage({
    name: "Wolle und Garn",
    path: "/shop",
    description: siteConfig.shopDescription,
  });
}

export function collectionPage(page: {
  name: string;
  path: string;
  description: string;
}): WithContext<CollectionPage> {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: page.name,
    url: absoluteUrl(page.path),
    description: page.description,
    inLanguage: "de",
    isPartOf: { "@id": `${siteConfig.url}/#website` },
  };
}

export function contactPage(): WithContext<ContactPage> {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Kontakt",
    url: absoluteUrl("/kontakt"),
    inLanguage: "de",
    mainEntity: { "@id": organizationId },
  };
}

function itemCondition(condition: string | null) {
  if (!condition) return undefined;
  const value = condition.toLowerCase();
  if (value.includes("generalüberholt") || value.includes("refurbished")) {
    return "https://schema.org/RefurbishedCondition";
  }
  if (value.includes("gebraucht") || value.includes("used") || value.includes("neuwertig")) {
    return "https://schema.org/UsedCondition";
  }
  if (value.includes("neu") || value === "new") return "https://schema.org/NewCondition";
  return undefined;
}

export function offerDescription(offer: OfferDetail) {
  const text = plainText(offer.descriptionHtml);
  if (!text) return `${offer.title}. Bestellung und Zahlung laufen über eBay.`;
  if (text.length <= 200) return text;
  return `${text.slice(0, 197).trimEnd()}…`;
}

function plainText(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function productColor(productFacts: NormalizedOffer) {
  if (productFacts.colorConflict) return undefined;
  if (productFacts.colorGroups.length > 1) return productFacts.colorGroups.join(" / ");
  if (productFacts.colorDescription) return productFacts.colorDescription;
  if (productFacts.colorGroups.length === 1) return productFacts.colorGroups[0];
  return undefined;
}

export function product(offer: OfferDetail, productFacts: NormalizedOffer): WithContext<Product> {
  const pageUrl = absoluteUrl(`/shop/${encodeURIComponent(offer.id)}`);
  const description = plainText(offer.descriptionHtml);
  const condition = itemCondition(offer.condition);
  const properties = [
    productFacts.colorNumber
      ? {
          "@type": "PropertyValue" as const,
          name: "Herstellerfarbnummer",
          value: productFacts.colorNumber,
        }
      : null,
    productFacts.titleColor
      ? {
          "@type": "PropertyValue" as const,
          name: "Farbe im Titel",
          value: productFacts.titleColor,
        }
      : null,
    productFacts.aspectColor
      ? {
          "@type": "PropertyValue" as const,
          name: "Farbe bei eBay",
          value: productFacts.aspectColor,
        }
      : null,
  ].filter((entry) => entry !== null);

  const node: WithContext<Product> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: pageTitle(productFacts),
    url: pageUrl,
    image: offer.images.length > 0 ? offer.images : undefined,
    description: description || offer.title,
    brand: productFacts.brand ? { "@type": "Brand", name: productFacts.brand } : undefined,
    color: productColor(productFacts),
    additionalProperty: properties.length > 0 ? properties : undefined,
  };

  if (offer.priceValue && offer.priceCurrency && offer.itemWebUrl) {
    const sale: Offer = {
      "@type": "Offer",
      url: offer.itemWebUrl,
      price: offer.priceValue,
      priceCurrency: offer.priceCurrency,
    };
    if (condition) sale.itemCondition = condition;
    node.offers = sale;
  }

  return node;
}

export type SchemaNode = WithContext<Thing> | WithContext<Thing>[];
