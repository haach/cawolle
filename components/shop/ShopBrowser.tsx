"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  aspectRefinements,
  categoryRefinements,
  offerMatches,
  parseAspectParams,
  type CatalogOffer,
} from "@/lib/shop";
import { OfferFilters } from "./OfferFilters";
import { OfferList } from "./OfferList";
import styles from "./ShopBrowser.module.css";

export function ShopBrowser({ offers }: { offers: CatalogOffer[] }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const categoryId = searchParams.get("category") ?? "";
  const selected = parseAspectParams(searchParams);
  const inCategory = categoryId
    ? offers.filter((offer) => offer.categoryId === categoryId)
    : offers;
  const categories = categoryRefinements(offers);
  const aspects = aspectRefinements(inCategory);
  const visible = inCategory.filter((offer) => offerMatches(offer, "", selected));

  function replace(next: URLSearchParams) {
    const serialized = next.toString();
    router.replace(serialized ? `${pathname}?${serialized}` : pathname, { scroll: false });
  }

  function toggleAspect(name: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    const current = parseAspectParams(next);
    const values = new Set(current[name] ?? []);
    if (values.has(value)) values.delete(value);
    else values.add(value);

    const updated = { ...current, [name]: [...values] };
    next.delete("aspect");
    for (const [aspectName, aspectValues] of Object.entries(updated)) {
      for (const aspectValue of aspectValues) {
        next.append("aspect", `${aspectName}:${aspectValue}`);
      }
    }
    replace(next);
  }

  if (offers.length === 0) {
    return <p className={styles.status}>Der Shop-Katalog ist noch leer.</p>;
  }

  const hasFilters = categories.length > 0 || aspects.length > 0;

  return (
    <div className={styles.layout}>
      {hasFilters && (
        <OfferFilters
          aspects={aspects}
          categoryId={categoryId}
          dominantCategoryId=""
          selected={selected}
          onToggle={toggleAspect}
        />
      )}
      <div className={styles.results}>
        {visible.length === 0 && <p className={styles.status}>Keine Angebote für diese Auswahl.</p>}
        {visible.length > 0 && (
          <>
            <p className={styles.count}>
              {visible.length === 1 ? "1 Angebot" : `${visible.length} Angebote`}
            </p>
            <OfferList offers={visible} />
          </>
        )}
      </div>
    </div>
  );
}
