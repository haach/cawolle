"use client";

import { useLayoutEffect, useRef, type FC } from "react";
import type { CatalogOffer } from "@/lib/shop";
import { Button } from "../atoms";
import { EmptyOffers } from "./EmptyOffers";
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
    clearSelection,
  } = useOfferFilters(offers);
  const listPaneRef = useRef<HTMLDivElement>(null);
  const aspectKey = aspectSelectionKey(selected);
  const previousAspects = useRef(aspectKey);

  useLayoutEffect(() => {
    if (previousAspects.current === aspectKey) return;
    previousAspects.current = aspectKey;
    const pane = listPaneRef.current;
    if (!pane) return;
    pane.scrollTo({ top: 0 });
    if (pane.scrollHeight <= pane.clientHeight + 1) {
      const top = pane.getBoundingClientRect().top + window.scrollY;
      if (window.scrollY > top) window.scrollTo({ top });
    }
  }, [aspectKey]);

  const scrollListToTop = () => {
    const pane = listPaneRef.current;
    if (!pane) return;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";
    if (pane.scrollHeight > pane.clientHeight + 1) {
      pane.scrollTo({ top: 0, behavior });
      return;
    }
    pane.scrollIntoView({ behavior, block: "start" });
  };

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
        {visible.length === 0 && <EmptyOffers onClear={clearSelection} />}
        {visible.length > 0 && (
          <>
            <p className={styles.count}>
              {visible.length === 1 ? "1 Angebot" : `${visible.length} Angebote`}
            </p>
            <div className={styles.listPane} ref={listPaneRef}>
              <OfferList offers={visible} filterQuery={filterQuery} />
              {visible.length >= 6 && (
                <div className={styles.toTop}>
                  <Button
                    icon={
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          d="M12 19V6M6.5 11.5 12 6l5.5 5.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    }
                    onClick={scrollListToTop}
                    aria-label="Zum Anfang der Liste"
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

function aspectSelectionKey(selected: Record<string, string[]>) {
  return Object.entries(selected)
    .sort(([left], [right]) => left.localeCompare(right, "de"))
    .map(
      ([name, values]) =>
        `${name}:${[...values].sort((left, right) => left.localeCompare(right, "de")).join(",")}`,
    )
    .join("|");
}
