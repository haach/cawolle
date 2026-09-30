import { useEffect, useId, useRef, useState } from "react";
import type { AspectRefinement } from "@/lib/shop";
import styles from "./OfferFilters.module.css";
import { Typography } from "../atoms";

type OfferFiltersProps = {
  aspects: AspectRefinement[];
  categoryId: string;
  dominantCategoryId: string;
  selected: Record<string, string[]>;
  onToggle: (name: string, value: string) => void;
  onReset: () => void;
};

export function OfferFilters({
  aspects,
  categoryId,
  dominantCategoryId,
  selected,
  onToggle,
  onReset,
}: OfferFiltersProps) {
  const panelId = useId();
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const aspectCount = Object.values(selected).reduce((sum, values) => sum + values.length, 0);
  const categoryWasChosen =
    categoryId !== "" && !(aspectCount > 0 && categoryId === dominantCategoryId);
  const activeCount = aspectCount + (categoryWasChosen ? 1 : 0);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 800px)");
    const closeDrawer = () => {
      if (!query.matches) setOpen(false);
    };
    query.addEventListener("change", closeDrawer);
    return () => query.removeEventListener("change", closeDrawer);
  }, []);

  useEffect(() => {
    if (!open) return;

    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className={styles.slot}>
      <div className={styles.toolbar}>
        <button
          type="button"
          className={`${styles.textButton} ${styles.showButton}`}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen(true)}
        >
          Filter anzeigen ({activeCount})
        </button>
        <button
          type="button"
          className={`${styles.textButton} ${styles.reset}`}
          onClick={onReset}
          disabled={activeCount === 0}
        >
          Alle filter zurücksetzen
        </button>
      </div>
      <button
        type="button"
        className={open ? styles.backdrop : styles.backdropHidden}
        aria-label="Filter schließen"
        tabIndex={open ? 0 : -1}
        onClick={() => setOpen(false)}
      />
      <aside
        id={panelId}
        className={open ? `${styles.filters} ${styles.open}` : styles.filters}
        role={open ? "dialog" : undefined}
        aria-modal={open ? true : undefined}
        aria-labelledby={open ? titleId : undefined}
      >
        <div className={styles.drawerHeader}>
          <div id={titleId}>
            <Typography variant="h2">Filter</Typography>
          </div>
          <button
            ref={closeRef}
            type="button"
            className={styles.close}
            aria-label="Filter schließen"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </div>
        <div className={styles.drawerBody}>
          {aspects.map((aspect) => (
            <fieldset key={aspect.name} className={styles.group}>
              <legend className={styles.label}>{aspect.name}</legend>
              <ul className={styles.values}>
                {aspect.values.map((entry) => {
                  const checked = selected[aspect.name]?.includes(entry.value) ?? false;
                  return (
                    <li key={entry.value}>
                      <label className={styles.option}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => onToggle(aspect.name, entry.value)}
                        />
                        <span>
                          {entry.value} ({entry.count})
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </fieldset>
          ))}
        </div>
        <div className={styles.drawerFooter}>
          <button type="button" className={styles.done} onClick={() => setOpen(false)}>
            Fertig
          </button>
        </div>
      </aside>
    </div>
  );
}
