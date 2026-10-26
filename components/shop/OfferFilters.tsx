import { useCallback, useId, useRef, useState, type FC } from "react";
import { COLORWAY_ASPECT, type AspectRefinement } from "@/lib/shop";
import { AspectFilters } from "./AspectFilters";
import { useDialog } from "./useDialog";
import styles from "./OfferFilters.module.css";
import { Typography } from "../atoms";

type OfferFiltersProps = {
  aspects: AspectRefinement[];
  selected: Record<string, string[]>;
  onToggle: (name: string, value: string) => void;
  onColorway: (value: string) => void;
  onReset: () => void;
};

export const OfferFilters: FC<OfferFiltersProps> = ({
  aspects,
  selected,
  onToggle,
  onColorway,
  onReset,
}) => {
  const panelId = useId();
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const activeCount = Object.values(selected).flat().length;

  useDialog(open, close, closeRef);

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
          Alle Filter zurücksetzen
        </button>
      </div>
      <button
        type="button"
        className={open ? styles.backdrop : styles.backdropHidden}
        aria-label="Filter schließen"
        tabIndex={open ? 0 : -1}
        onClick={close}
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
            onClick={close}
          >
            ×
          </button>
        </div>
        <div className={styles.drawerBody}>
          <AspectFilters
            aspects={aspects}
            selected={selected}
            colorway={selected[COLORWAY_ASPECT]?.[0] ?? ""}
            onToggle={onToggle}
            onColorway={onColorway}
          />
        </div>
        <div className={styles.drawerFooter}>
          <button type="button" className={styles.done} onClick={close}>
            Fertig
          </button>
        </div>
      </aside>
    </div>
  );
};
