import { existsSync } from "node:fs";
import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import type { CatalogOffer } from "../lib/shop";
import { EbayRequestError, listActiveSellerItems, loadSellerOffers } from "../services/ebay-api";

const shopDir = path.join(process.cwd(), "data", "shop");
const stagingDir = path.join(process.cwd(), "data", "shop-staging");
const backupDir = path.join(process.cwd(), "data", "shop-backup");

async function withRetry<T>(run: () => Promise<T>) {
  try {
    return await run();
  } catch (error) {
    if (!(error instanceof EbayRequestError) || error.status !== 429) throw error;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return run();
  }
}

async function mapPool<T, R>(items: T[], limit: number, run: (item: T) => Promise<R>) {
  const results = new Array<R>(items.length);
  let next = 0;

  async function worker() {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await run(items[index]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}

async function publish(directory: string) {
  await rm(backupDir, { recursive: true, force: true });
  if (existsSync(shopDir)) await rename(shopDir, backupDir);
  try {
    await rename(directory, shopDir);
  } catch (error) {
    if (existsSync(backupDir) && !existsSync(shopDir)) await rename(backupDir, shopDir);
    throw error;
  }
  await rm(backupDir, { recursive: true, force: true });
}

async function main() {
  if (!process.env.EBAY_REFRESH_TOKEN?.trim()) {
    throw new Error("EBAY_REFRESH_TOKEN fehlt.");
  }

  const listings = await listActiveSellerItems();
  const groups = await mapPool(listings, 4, async (listing) => {
    const details = await withRetry(() => loadSellerOffers(listing.id));
    return details.map((detail) => {
      const offer: CatalogOffer = {
        id: detail.id,
        title: detail.title,
        price: detail.price,
        imageUrl: detail.images[0] ?? null,
        condition: detail.condition,
        categoryId: listing.categoryId,
        categoryName: listing.categoryName,
        aspects: detail.aspects,
      };
      return { offer, detail };
    });
  });
  const offers = groups.flat();

  await rm(stagingDir, { recursive: true, force: true });
  await mkdir(path.join(stagingDir, "offers"), { recursive: true });
  for (const entry of offers) {
    await writeFile(
      path.join(stagingDir, "offers", `${entry.offer.id}.json`),
      JSON.stringify(entry.detail),
    );
  }
  await writeFile(
    path.join(stagingDir, "catalog.json"),
    JSON.stringify({
      syncedAt: new Date().toISOString(),
      offers: offers.map((entry) => entry.offer),
    }),
  );
  await publish(stagingDir);
  console.log(`Shop-Katalog: ${offers.length} Angebote`);
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.message : "Der Shop-Katalog konnte nicht geladen werden.";
  console.error(message);
  process.exit(1);
});
