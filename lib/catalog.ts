import { readFileSync } from "node:fs";
import path from "node:path";
import "server-only";

import type { OfferDetail, ShopCatalog } from "@/lib/shop";

const root = path.join(process.cwd(), "data", "shop");

const emptyCatalog: ShopCatalog = { syncedAt: "", offers: [] };

export function readCatalog(): ShopCatalog {
  try {
    const parsed = JSON.parse(readFileSync(path.join(root, "catalog.json"), "utf8")) as ShopCatalog;
    if (!Array.isArray(parsed.offers)) return emptyCatalog;
    return parsed;
  } catch {
    return emptyCatalog;
  }
}

export function readOffer(id: string): OfferDetail | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(id);
  } catch {
    return null;
  }
  if (!/^\d+(?:-\d+)?$/.test(decoded)) return null;

  try {
    return JSON.parse(
      readFileSync(path.join(root, "offers", `${decoded}.json`), "utf8"),
    ) as OfferDetail;
  } catch {
    return null;
  }
}
