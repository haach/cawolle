import { XMLParser } from "fast-xml-parser";
import sanitizeHtml from "sanitize-html";

import { formatPrice, largeEbayImage, type OfferDetail } from "@/lib/shop";

const SCOPE = "https://api.ebay.com/oauth/api_scope";
const SELLER_SCOPE = "https://api.ebay.com/oauth/api_scope/sell.inventory";

type Config = {
  clientId: string;
  clientSecret: string;
  seller: string;
  origin: string;
};

type Token = { value: string; expiresAt: number };

type Money = { value?: string; currency?: string };

type Image = { imageUrl?: string };

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
  const legacyId = match?.[1] ?? (/^\d+$/.test(decoded) ? decoded : null);
  if (!legacyId) return `/buy/browse/v1/item/${encodeURIComponent(decoded)}?fieldgroups=PRODUCT`;

  const params = new URLSearchParams({ legacy_item_id: legacyId, fieldgroups: "PRODUCT" });
  if (match && match[2] !== "0") params.set("legacy_variation_id", match[2]);
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

function publicOfferId(itemId: string) {
  const match = /^v1\|([^|]+)\|([^|]+)$/.exec(itemId);
  if (!match) return itemId;
  if (match[2] === "0") return match[1];
  return `${match[1]}-${match[2]}`;
}

function offerFromItem(item: ItemResponse, id: string): OfferDetail {
  const money = moneyOf(item.price) ?? moneyOf(item.currentBidPrice);
  return {
    id,
    title: item.title ?? "",
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
}

function assertSeller(item: ItemResponse, config: Config) {
  if (!item.itemId || !item.title) {
    throw new EbayRequestError("Das Angebot wurde nicht gefunden.", 404);
  }
  if (item.seller?.username && item.seller.username.toLowerCase() !== config.seller.toLowerCase()) {
    throw new EbayRequestError("Das Angebot gehört nicht zu diesem Shop.", 404);
  }
}

export async function fetchOffer(id: string): Promise<OfferDetail> {
  const config = requireConfig();
  const item = await ebayGet<ItemResponse>(config, itemPath(id));
  assertSeller(item, config);
  return offerFromItem(item, item.itemId as string);
}

type ItemGroupResponse = {
  items?: ItemResponse[];
  commonDescriptions?: { description?: string; itemIds?: string[] }[];
};

async function fetchItemGroup(groupId: string): Promise<OfferDetail[]> {
  const config = requireConfig();
  const params = new URLSearchParams({ item_group_id: groupId });
  const body = await ebayGet<ItemGroupResponse>(
    config,
    `/buy/browse/v1/item/get_items_by_item_group?${params.toString()}`,
  );
  const items = body.items ?? [];
  if (items.length === 0) {
    throw new EbayRequestError("Die Varianten wurden nicht gefunden.", 404);
  }

  return items.map((item) => {
    assertSeller(item, config);
    const description = body.commonDescriptions?.find((entry) =>
      entry.itemIds?.includes(item.itemId as string),
    )?.description;
    const detail = offerFromItem(
      { ...item, description: description ?? item.description },
      publicOfferId(item.itemId as string),
    );
    if (items.length < 2) return detail;
    const color = detail.aspects.find(
      (aspect) => aspect.name.localeCompare("Farbe", "de", { sensitivity: "base" }) === 0,
    )?.value;
    if (!color || detail.title.includes(color)) return detail;
    return { ...detail, title: `${detail.title}, ${color}` };
  });
}

export async function loadSellerOffers(id: string): Promise<OfferDetail[]> {
  try {
    const detail = await fetchOffer(id);
    return [{ ...detail, id: publicOfferId(detail.id) }];
  } catch (error) {
    if (!(error instanceof EbayRequestError)) throw error;
    const groupId = error.message.match(/item_group_id=(\d+)/)?.[1];
    if (!groupId) throw error;
    return fetchItemGroup(groupId);
  }
}

export type SellerListItem = {
  id: string;
  categoryId: string | null;
  categoryName: string | null;
};

const sellerListParser = new XMLParser({
  ignoreAttributes: true,
  removeNSPrefix: true,
  parseTagValue: false,
  isArray: (tagName) => tagName === "Item" || tagName === "Errors",
});

type SellerListItemXml = {
  ItemID?: unknown;
  SellingStatus?: { ListingStatus?: unknown };
  PrimaryCategory?: { CategoryID?: unknown; CategoryName?: unknown };
};

type SellerListDocument = {
  GetSellerListResponse?: {
    Ack?: unknown;
    HasMoreItems?: unknown;
    Errors?: { LongMessage?: unknown }[];
    ItemArray?: { Item?: SellerListItemXml[] };
  };
};

function text(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function readSellerList(xml: string) {
  const parsed = sellerListParser.parse(xml) as SellerListDocument;
  const body = parsed.GetSellerListResponse;
  if (!body) {
    throw new EbayRequestError("Die Angebotsliste konnte nicht gelesen werden.", 502);
  }
  if (text(body.Ack) === "Failure") {
    const message = body.Errors?.map((entry) => text(entry.LongMessage)).find(
      (entry): entry is string => Boolean(entry),
    );
    throw new EbayRequestError(message ?? "Die Angebotsliste konnte nicht geladen werden.", 502);
  }

  const items = (body.ItemArray?.Item ?? []).flatMap((item) => {
    const id = text(item.ItemID);
    if (text(item.SellingStatus?.ListingStatus) !== "Active" || !id) return [];
    return [
      {
        id,
        categoryId: text(item.PrimaryCategory?.CategoryID),
        categoryName: text(item.PrimaryCategory?.CategoryName),
      },
    ];
  });

  return { items, hasMore: text(body.HasMoreItems) === "true" };
}

async function getUserAccessToken(config: Config) {
  const refreshToken = process.env.EBAY_REFRESH_TOKEN?.trim();
  if (!refreshToken) throw new EbayConfigError();

  const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");
  const response = await fetch(`${config.origin}/identity/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      scope: SELLER_SCOPE,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new EbayRequestError(
      "Die Seller-Anmeldung bei eBay ist fehlgeschlagen.",
      response.status,
    );
  }

  const body = (await response.json()) as { access_token?: string };
  if (!body.access_token) {
    throw new EbayRequestError("eBay hat kein Nutzer-Token geliefert.", 502);
  }
  return body.access_token;
}

export async function listActiveSellerItems(): Promise<SellerListItem[]> {
  const config = requireConfig();
  const accessToken = await getUserAccessToken(config);
  const start = new Date();
  const end = new Date(start.getTime() + 119 * 24 * 60 * 60 * 1000);
  const items: SellerListItem[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore && page <= 20) {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<GetSellerListRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <ErrorLanguage>de_DE</ErrorLanguage>
  <GranularityLevel>Coarse</GranularityLevel>
  <IncludeVariations>true</IncludeVariations>
  <EndTimeFrom>${start.toISOString()}</EndTimeFrom>
  <EndTimeTo>${end.toISOString()}</EndTimeTo>
  <Pagination>
    <EntriesPerPage>200</EntriesPerPage>
    <PageNumber>${page}</PageNumber>
  </Pagination>
</GetSellerListRequest>`;

    const response = await fetch(`${config.origin}/ws/api.dll`, {
      method: "POST",
      headers: {
        "X-EBAY-API-CALL-NAME": "GetSellerList",
        "X-EBAY-API-SITEID": "77",
        "X-EBAY-API-COMPATIBILITY-LEVEL": "1177",
        "X-EBAY-API-IAF-TOKEN": accessToken,
        "Content-Type": "text/xml",
      },
      body: xml,
      cache: "no-store",
    });
    const responseXml = await response.text();
    if (!response.ok) {
      throw new EbayRequestError("Die Angebotsliste konnte nicht geladen werden.", response.status);
    }

    const sellerList = readSellerList(responseXml);
    items.push(...sellerList.items);
    hasMore = sellerList.hasMore;
    page += 1;
  }

  return items;
}
