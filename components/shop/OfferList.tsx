"use client";

import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useLayoutEffect, useRef, useState } from "react";
import type { OfferTeaser } from "@/lib/shop";
import { OfferCard } from "./OfferCard";
import styles from "./OfferList.module.css";

const ROW_GAP = 16;

function columnCount(width: number) {
  if (width >= 900) return 3;
  if (width >= 560) return 2;
  return 1;
}

export function OfferList({ offers }: { offers: OfferTeaser[] }) {
  const listRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(1);
  const [scrollMargin, setScrollMargin] = useState(0);
  const rows = Math.ceil(offers.length / columns);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const measure = () => {
      setColumns(columnCount(list.clientWidth));
      const top = list.getBoundingClientRect().top + window.scrollY;
      setScrollMargin(top);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const virtualizer = useWindowVirtualizer({
    count: rows,
    estimateSize: () => 430,
    overscan: 3,
    scrollMargin,
    gap: ROW_GAP,
  });

  return (
    <div ref={listRef} className={styles.list}>
      <div className={styles.viewport} style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((row) => {
          const start = row.index * columns;
          const visible = offers.slice(start, start + columns);

          return (
            <div
              key={row.key}
              data-index={row.index}
              ref={virtualizer.measureElement}
              className={styles.row}
              style={{
                transform: `translateY(${row.start - scrollMargin}px)`,
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              }}
            >
              {visible.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
