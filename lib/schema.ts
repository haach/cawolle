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
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Shop",
    url: absoluteUrl("/shop"),
    description: siteConfig.shopDescription,
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

export function product(offer: OfferDetail): WithContext<Product> | null {
  if (!offer.priceValue || !offer.priceCurrency) return null;

  const pageUrl = absoluteUrl(`/shop/${encodeURIComponent(offer.id)}`);
  const brand = offer.aspects.find(
    (aspect) => aspect.name.localeCompare("Marke", "de", { sensitivity: "base" }) === 0,
  );
  const description = plainText(offer.descriptionHtml);
  const condition = itemCondition(offer.condition);
  const sale: Offer = {
    "@type": "Offer",
    url: offer.itemWebUrl ?? pageUrl,
    price: offer.priceValue,
    priceCurrency: offer.priceCurrency,
    availability: "https://schema.org/InStock",
    seller: { "@id": organizationId },
  };
  if (condition) sale.itemCondition = condition;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: offer.title,
    url: pageUrl,
    image: offer.images.length > 0 ? offer.images : undefined,
    description: description || offer.title,
    brand: brand ? { "@type": "Brand", name: brand.value } : undefined,
    offers: sale,
  };
}

export type SchemaNode = WithContext<Thing> | WithContext<Thing>[];
