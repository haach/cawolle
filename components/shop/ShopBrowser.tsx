"use client";

import { useLayoutEffect, useRef, type FC } from "react";
import { canonicalBrand, normalizeOffer, slugify } from "@/lib/normalize";
import { OTHER_BRAND } from "@/services/producers";
import { COLORWAY_ASPECT, type CatalogOffer } from "@/lib/shop";
import { Button, Spacing, Typography } from "../atoms";
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
  const activeFilters = activeFilterLabels(selected);
  const alternative = visible.length === 0 ? emptyAlternative(offers, query, selected) : undefined;
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
    return <Typography className={styles.status}>Der Shop-Katalog ist noch leer.</Typography>;
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
      <Spacing space={20} alignItems="stretch" className={styles.results}>
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
        {activeFilters.length > 0 && (
          <Typography className={styles.count}>
            Aktive Filter: {activeFilters.join(", ")}
          </Typography>
        )}
        {visible.length === 0 && <EmptyOffers onClear={clearSelection} alternative={alternative} />}
        {visible.length > 0 && (
          <>
            <Typography className={styles.count}>
              {visible.length === 1 ? "1 Angebot" : `${visible.length} Angebote`}
            </Typography>
            <div className={styles.listPane} ref={listPaneRef}>
              <OfferList offers={visible} filterQuery={filterQuery} />
              {visible.length >= 6 && (
                <Spacing dir="row" justifyContent="center" className={styles.toTop}>
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
                </Spacing>
              )}
            </div>
          </>
        )}
      </Spacing>
    </div>
  );
};

function activeFilterLabels(selected: Record<string, string[]>) {
  return Object.entries(selected).flatMap(([name, values]) =>
    values.map((value) => (name === COLORWAY_ASPECT ? `Farbnummer ${value}` : value)),
  );
}

function emptyAlternative(
  offers: CatalogOffer[],
  query: string,
  selected: Record<string, string[]>,
) {
  const brands = selected.Marke ?? [];
  if (brands.length === 1 && brands[0] !== OTHER_BRAND) {
    const brand = canonicalBrand(brands[0]);
    return { href: `/marken/${slugify(brand)}`, label: `Alle Angebote von ${brand}` };
  }

  const digits = query.trim();
  if (!/^\d+$/.test(digits)) return undefined;
  const hits = [
    ...new Set(
      offers
        .filter((offer) => normalizeOffer(offer).colorNumber === digits)
        .map((offer) => normalizeOffer(offer).brand)
        .filter((brand): brand is string => Boolean(brand)),
    ),
  ];
  if (hits.length !== 1) return undefined;
  return { href: `/marken/${slugify(hits[0])}`, label: `Farbe ${digits} bei ${hits[0]} ansehen` };
}

function aspectSelectionKey(selected: Record<string, string[]>) {
  return Object.entries(selected)
    .sort(([left], [right]) => left.localeCompare(right, "de"))
    .map(
      ([name, values]) =>
        `${name}:${[...values].sort((left, right) => left.localeCompare(right, "de")).join(",")}`,
    )
    .join("|");
}
