import { useEffect, useId, useRef, useState } from "react";
import type { AspectRefinement, CategoryRefinement } from "@/lib/shop";
import styles from "./OfferFilters.module.css";
import { Button, Typography } from "../atoms";

type OfferFiltersProps = {
  categories: CategoryRefinement[];
  aspects: AspectRefinement[];
  categoryId: string;
  dominantCategoryId: string;
  selected: Record<string, string[]>;
  onCategory: (id: string) => void;
  onToggle: (name: string, value: string) => void;
};

export function OfferFilters({
  aspects,
  categoryId,
  dominantCategoryId,
  selected,
  onToggle,
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
    const closeOnDesktop = () => {
      if (!query.matches) setOpen(false);
    };
    query.addEventListener("change", closeOnDesktop);
    return () => query.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    if (!open) return;

    closeRef.current?.focus();
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);

    return () => {
      html.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={styles.slot}>
      <Button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(true)}
      >
        <span>Filter anzeigen</span>
        {activeCount > 0 && <span className={styles.count}>{activeCount}</span>}
      </Button>
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
          <Typography variant="h2">Filter</Typography>
          <Button ref={closeRef} type="button" onClick={() => setOpen(false)}>
            Schließen
          </Button>
        </div>
        <div className={styles.drawerBody}>
          {/* {categories.length > 0 && (
            <label className={styles.field}>
              <span className={styles.label}>Kategorie</span>
              <select
                className={styles.control}
                value={categoryId}
                onChange={(event) => onCategory(event.target.value)}
              >
                <option value="">Alle Kategorien</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>
            </label>
          )} */}
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
