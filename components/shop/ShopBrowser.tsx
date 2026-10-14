"use client";

import type { FC } from "react";
import type { CatalogOffer } from "@/lib/shop";
import { OfferFilters } from "./OfferFilters";
import { OfferList } from "./OfferList";
import { useOfferFilters } from "./useOfferFilters";
import styles from "./ShopBrowser.module.css";

type ShopBrowserProps = {
  offers: CatalogOffer[];
};

export const ShopBrowser: FC<ShopBrowserProps> = ({ offers }) => {
  const {
    query,
    filterQuery,
    selected,
    aspects,
    visible,
    setQuery,
    toggleAspect,
    setColorway,
    resetFilters,
  } = useOfferFilters(offers);

  if (offers.length === 0) {
    return <p className={styles.status}>Der Shop-Katalog ist noch leer.</p>;
  }

  return (
    <div className={styles.layout}>
      {aspects.length > 0 && (
        <OfferFilters
          aspects={aspects}
          selected={selected}
          onToggle={toggleAspect}
          onColorway={setColorway}
          onReset={resetFilters}
        />
      )}
      <div className={styles.results}>
        <label className={styles.search}>
          <span className={styles.label}>Suche</span>
          <input
            className={styles.control}
            type="search"
            name="q"
            value={query}
            placeholder="Titel, Marke, Farbe, Material …"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        {visible.length === 0 && <p className={styles.status}>Keine Angebote für diese Auswahl.</p>}
        {visible.length > 0 && (
          <>
            <p className={styles.count}>
              {visible.length === 1 ? "1 Angebot" : `${visible.length} Angebote`}
            </p>
            <OfferList offers={visible} filterQuery={filterQuery} />
          </>
        )}
      </div>
    </div>
  );
};
