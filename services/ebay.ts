import { cache } from "react";
import "server-only";
import sanitizeHtml from "sanitize-html";

import {
  formatPrice,
  largeEbayImage,
  type OfferDetail,
  type OfferTeaser,
  type ShopListing,
} from "@/lib/shop";

const SCOPE = "https://api.ebay.com/oauth/api_scope";
const PAGE_LIMIT = 200;
const MAX_OFFERS = 1000;

type Config = {
  clientId: string;
  clientSecret: string;
  seller: string;
  origin: string;
  searchQuery: string;
};

type Token = { value: string; expiresAt: number };

type Money = { value?: string; currency?: string };

type Image = { imageUrl?: string };

type Summary = {
  itemId?: string;
  title?: string;
  image?: Image;
  price?: Money;
  currentBidPrice?: Money;
  condition?: string;
};

type SearchPage = {
  total?: number;
  itemSummaries?: Summary[];
  next?: string;
  refinement?: {
    dominantCategoryId?: string;
    categoryDistributions?: { categoryId?: string; categoryName?: string; matchCount?: number }[];
    aspectDistributions?: {
      localizedAspectName?: string;
      aspectValueDistributions?: { localizedAspectValue?: string; matchCount?: number }[];
    }[];
  };
};

type ItemResponse = {
  itemId?: string;
  title?: string;
  price?: Money;
  currentBidPrice?: Money;
  condition?: string;
  itemWebUrl?: string;
  description?: string;
  seller?: { username?: string };
  image?: Image;
  additionalImages?: Image[];
  product?: { image?: Image; additionalImages?: Image[]; description?: string };
  localizedAspects?: { name?: string; value?: string }[];
};

export class EbayConfigError extends Error {
  constructor() {
    super("eBay ist nicht konfiguriert.");
    this.name = "EbayConfigError";
  }
}

export class EbayRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "EbayRequestError";
    this.status = status;
  }
}

let token: Token | null = null;
let pendingToken: Promise<string> | null = null;

function readConfig(): Config | null {
  const clientId = process.env.EBAY_CLIENT_ID?.trim();
  const clientSecret = process.env.EBAY_CLIENT_SECRET?.trim();
  const seller = process.env.EBAY_SELLER_USERNAME?.trim();
  if (!clientId || !clientSecret || !seller) return null;

  const sandbox = process.env.EBAY_ENVIRONMENT?.trim() === "sandbox";

  return {
    clientId,
    clientSecret,
    seller,
    origin: sandbox ? "https://api.sandbox.ebay.com" : "https://api.ebay.com",
    searchQuery: process.env.EBAY_SEARCH_QUERY?.trim() ?? "",
  };
}

function requireConfig() {
  const config = readConfig();
  if (!config) throw new EbayConfigError();
  return config;
}

async function getAccessToken(config: Config) {
  if (token && token.expiresAt > Date.now() + 60_000) return token.value;
  if (pendingToken) return pendingToken;

  pendingToken = (async () => {
    const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");
    const response = await fetch(`${config.origin}/identity/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ grant_type: "client_credentials", scope: SCOPE }),
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = await response.text();
      let reason = "Prüfen Sie die Schlüssel in der Umgebung.";
      try {
        const body = JSON.parse(detail) as { error?: string; error_description?: string };
        const description = body.error_description ?? "";
        if (body.error === "unauthorized_client" || /grant type/i.test(description)) {
          reason =
            "Die Schlüssel sind gültig, aber der Zugriff ohne Nutzer-Anmeldung ist für diese Anwendung noch nicht freigeschaltet. Auf der eBay-Schlüsselseite beim Production-Keyset den Client-Credentials-Grant aktivieren.";
        } else if (description) reason = description;
        else if (body.error) reason = body.error;
      } catch {
        if (detail) reason = detail.slice(0, 180);
      }
      throw new EbayRequestError(
        `Die Anmeldung bei eBay ist fehlgeschlagen. ${reason}`,
        response.status,
      );
    }

    const body = (await response.json()) as { access_token?: string; expires_in?: number };
    if (!body.access_token) {
      throw new EbayRequestError("eBay hat kein Zugriffstoken geliefert.", 502);
    }

    token = {
      value: body.access_token,
      expiresAt: Date.now() + (body.expires_in ?? 7200) * 1000,
    };
    return body.access_token;
  })().finally(() => {
    pendingToken = null;
  });

  return pendingToken;
}

async function ebayGet<T>(config: Config, path: string, retry = true): Promise<T> {
  const accessToken = await getAccessToken(config);
  const response = await fetch(`${config.origin}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-EBAY-C-MARKETPLACE-ID": "EBAY_DE",
      "Accept-Language": "de-DE",
    },
    cache: "no-store",
  });

  if (response.status === 401 && retry) {
    token = null;
    return ebayGet(config, path, false);
  }

  if (!response.ok) {
    const detail = await response.text();
    throw new EbayRequestError(ebayErrorMessage(detail), response.status);
  }

  return (await response.json()) as T;
}

function moneyOf(money: Money | undefined) {
  if (!money?.value || !money.currency) return null;
  return {
    label: formatPrice(money.value, money.currency),
    value: money.value,
    currency: money.currency,
  };
}

function escapeAspect(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\|/g, "\\|");
}

function aspectFilter(categoryId: string, aspects: Record<string, string[]>) {
  if (!categoryId) return null;

  const groups = Object.entries(aspects)
    .filter(([, values]) => values.length > 0)
    .map(([name, values]) => `${escapeAspect(name)}:{${values.map(escapeAspect).join("|")}}`);

  if (groups.length === 0) return null;
  return `categoryId:${categoryId},${groups.join(",")}`;
}

function toTeaser(item: Summary): OfferTeaser | null {
  if (!item.itemId || !item.title) return null;

  return {
    id: item.itemId,
    title: item.title,
    price: (moneyOf(item.price) ?? moneyOf(item.currentBidPrice))?.label ?? null,
    imageUrl: item.image?.imageUrl ? largeEbayImage(item.image.imageUrl) : null,
    condition: item.condition ?? null,
  };
}

function refinementsFrom(page: SearchPage): ShopListing["refinements"] {
  const categories = (page.refinement?.categoryDistributions ?? [])
    .filter((category) => category.categoryId && category.categoryName)
    .map((category) => ({
      id: category.categoryId as string,
      name: category.categoryName as string,
      count: category.matchCount ?? 0,
    }));

  const aspects = (page.refinement?.aspectDistributions ?? [])
    .filter((aspect) => aspect.localizedAspectName)
    .map((aspect) => ({
      name: aspect.localizedAspectName as string,
      values: (aspect.aspectValueDistributions ?? [])
        .filter((entry) => entry.localizedAspectValue)
        .map((entry) => ({
          value: entry.localizedAspectValue as string,
          count: entry.matchCount ?? 0,
        })),
    }))
    .filter((aspect) => aspect.values.length > 0);

  return {
    categories,
    aspects,
    categoryId: page.refinement?.dominantCategoryId ?? null,
  };
}

function countedCategory(
  refinements: ShopListing["refinements"],
  categoryId: string,
  total: number,
): ShopListing["refinements"] {
  if (!categoryId) return refinements;

  return {
    ...refinements,
    categories: refinements.categories.map((category) =>
      category.id === categoryId && category.count === 0 ? { ...category, count: total } : category,
    ),
  };
}

async function collectOffers(
  config: Config,
  input: { q: string; categoryId: string; aspects: Record<string, string[]> },
  options?: { firstPageOnly?: boolean },
): Promise<ShopListing & { total: number }> {
  const params = new URLSearchParams();
  const query = input.q.trim() || config.searchQuery;
  if (query) params.set("q", query);
  if (input.categoryId) params.set("category_ids", input.categoryId);

  const filter = aspectFilter(input.categoryId, input.aspects);
  if (filter) params.set("aspect_filter", filter);

  params.set("filter", `sellers:{${escapeAspect(config.seller)}}`);
  params.set("fieldgroups", "ASPECT_REFINEMENTS,CATEGORY_REFINEMENTS,EXTENDED");
  params.set("limit", String(PAGE_LIMIT));

  const offers: ShopListing["offers"] = [];
  let path: string | null = `/buy/browse/v1/item_summary/search?${params.toString()}`;
  let refinements: ShopListing["refinements"] | null = null;
  let total = 0;
  let pages = 0;

  while (path && offers.length < MAX_OFFERS && pages < 6) {
    pages += 1;
    const page: SearchPage = await ebayGet<SearchPage>(config, path);
    if (!refinements) {
      refinements = refinementsFrom(page);
      total = page.total ?? 0;
    }

    for (const item of page.itemSummaries ?? []) {
      const teaser = toTeaser(item);
      if (teaser) offers.push(teaser);
      if (offers.length >= MAX_OFFERS) break;
    }

    if (options?.firstPageOnly || !page.next) break;
    const next = new URL(page.next);
    if (next.origin !== config.origin) break;
    path = `${next.pathname}${next.search}`;
  }

  return {
    offers,
    total,
    refinements: refinements ?? { categories: [], aspects: [], categoryId: null },
  };
}

const defaultQueries = ["Garn", "Wolle", "Nadel", "Knopf", "Kurzwaren"];

function mergeListings(listings: ShopListing[]): ShopListing {
  const offers: ShopListing["offers"] = [];
  const seen = new Set<string>();
  for (const listing of listings) {
    for (const offer of listing.offers) {
      if (seen.has(offer.id)) continue;
      seen.add(offer.id);
      offers.push(offer);
    }
  }

  const categories = new Map<string, ShopListing["refinements"]["categories"][number]>();
  for (const listing of listings) {
    for (const category of listing.refinements.categories) {
      const current = categories.get(category.id);
      if (!current || category.count > current.count) categories.set(category.id, category);
    }
  }

  const aspects = new Map<string, Map<string, number>>();
  for (const listing of listings) {
    for (const aspect of listing.refinements.aspects) {
      const values = aspects.get(aspect.name) ?? new Map<string, number>();
      aspects.set(aspect.name, values);
      for (const entry of aspect.values) {
        values.set(entry.value, Math.max(values.get(entry.value) ?? 0, entry.count));
      }
    }
  }

  return {
    offers,
    refinements: {
      categories: [...categories.values()],
      aspects: [...aspects.entries()].map(([name, values]) => ({
        name,
        values: [...values.entries()].map(([value, count]) => ({ value, count })),
      })),
      categoryId:
        listings.find((listing) => listing.refinements.categoryId)?.refinements.categoryId ?? null,
    },
  };
}

export async function searchOffers(input: {
  q: string;
  categoryId: string;
  aspects: Record<string, string[]>;
}): Promise<ShopListing> {
  const config = requireConfig();
  const hasAspects = Object.values(input.aspects).some((values) => values.length > 0);
  if (input.q.trim() || input.categoryId || config.searchQuery) {
    const listing = await collectOffers(config, input);
    if (!hasAspects) {
      return {
        offers: listing.offers,
        refinements: countedCategory(listing.refinements, input.categoryId, listing.total),
      };
    }

    const base = await collectOffers(config, { ...input, aspects: {} }, { firstPageOnly: true });
    return {
      offers: listing.offers,
      refinements: countedCategory(base.refinements, input.categoryId, base.total),
    };
  }

  const listings: ShopListing[] = [];
  let lastError: unknown;
  for (const q of defaultQueries) {
    try {
      listings.push(await collectOffers(config, { ...input, q }));
    } catch (error) {
      lastError = error;
    }
  }

  if (listings.length === 0) {
    throw lastError instanceof Error
      ? lastError
      : new EbayRequestError("Die Angebote konnten nicht geladen werden.", 502);
  }

  return mergeListings(listings);
}

function collectImages(item: ItemResponse) {
  const urls = [
    item.image?.imageUrl,
    ...(item.additionalImages ?? []).map((image) => image.imageUrl),
    item.product?.image?.imageUrl,
    ...(item.product?.additionalImages ?? []).map((image) => image.imageUrl),
  ].filter((url): url is string => Boolean(url));

  return [...new Set(urls.map(largeEbayImage))];
}

function cleanDescription(html: string | undefined) {
  if (!html) return "";

  return sanitizeHtml(html, {
    allowedTags: ["p", "br", "ul", "ol", "li", "strong", "em", "b", "i", "h2", "h3", "a"],
    allowedAttributes: { a: ["href", "title"] },
    allowedSchemes: ["http", "https", "mailto"],
  });
}

function itemPath(id: string) {
  const decoded = decodeItemId(id);
  const match = /^v1\|([^|]+)\|([^|]+)$/.exec(decoded);
  if (!match) return `/buy/browse/v1/item/${encodeURIComponent(decoded)}?fieldgroups=PRODUCT`;

  const params = new URLSearchParams({ legacy_item_id: match[1], fieldgroups: "PRODUCT" });
  if (match[2] !== "0") params.set("legacy_variation_id", match[2]);
  return `/buy/browse/v1/item/get_item_by_legacy_id?${params.toString()}`;
}

function decodeItemId(id: string) {
  let current = id;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const decoded = decodeURIComponent(current);
      if (decoded === current) return current;
      current = decoded;
    } catch {
      return current;
    }
  }
  return current;
}

function ebayErrorMessage(detail: string) {
  const trimmed = detail.trim();
  if (trimmed.startsWith("{")) {
    try {
      const body = JSON.parse(trimmed) as {
        errors?: { message?: string }[];
        error_description?: string;
      };
      const message =
        body.errors?.find((entry) => entry.message)?.message ?? body.error_description;
      if (message) return message;
    } catch {
      // The body is not JSON. Fall through to the generic message.
    }
  }

  if (trimmed.startsWith("<") || /<!doctype html/i.test(trimmed)) {
    return "eBay hat die Anfrage abgelehnt.";
  }

  return trimmed.slice(0, 240) || "eBay hat die Anfrage abgelehnt.";
}

export const getOffer = cache(async (id: string): Promise<OfferDetail> => {
  const config = requireConfig();
  const item = await ebayGet<ItemResponse>(config, itemPath(id));

  if (!item.itemId || !item.title) {
    throw new EbayRequestError("Das Angebot wurde nicht gefunden.", 404);
  }

  if (item.seller?.username && item.seller.username.toLowerCase() !== config.seller.toLowerCase()) {
    throw new EbayRequestError("Das Angebot gehört nicht zu diesem Shop.", 404);
  }

  const money = moneyOf(item.price) ?? moneyOf(item.currentBidPrice);

  return {
    id: item.itemId,
    title: item.title,
    price: money?.label ?? null,
    priceValue: money?.value ?? null,
    priceCurrency: money?.currency ?? null,
    condition: item.condition ?? null,
    aspects: (item.localizedAspects ?? [])
      .filter((aspect) => aspect.name && aspect.value)
      .map((aspect) => ({ name: aspect.name as string, value: aspect.value as string })),
    images: collectImages(item),
    descriptionHtml: cleanDescription(item.description ?? item.product?.description),
    itemWebUrl: item.itemWebUrl ?? null,
  };
});
