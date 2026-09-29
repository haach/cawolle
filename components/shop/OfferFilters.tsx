import type { AspectRefinement, CategoryRefinement } from "@/lib/shop";
import styles from "./OfferFilters.module.css";

type OfferFiltersProps = {
  categories: CategoryRefinement[];
  aspects: AspectRefinement[];
  categoryId: string;
  selected: Record<string, string[]>;
  onCategory: (id: string) => void;
  onToggle: (name: string, value: string) => void;
};

export function OfferFilters({
  categories,
  aspects,
  categoryId,
  selected,
  onCategory,
  onToggle,
}: OfferFiltersProps) {
  return (
    <aside className={styles.filters}>
      {categories.length > 0 && (
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
      )}
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
    </aside>
  );
}
