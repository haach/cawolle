import type { FC } from "react";
import type { AspectRefinement } from "@/lib/shop";
import styles from "./OfferFilters.module.css";

type AspectFiltersProps = {
  aspects: AspectRefinement[];
  selected: Record<string, string[]>;
  onToggle: (name: string, value: string) => void;
};

export const AspectFilters: FC<AspectFiltersProps> = ({ aspects, selected, onToggle }) => (
  <>
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
  </>
);
