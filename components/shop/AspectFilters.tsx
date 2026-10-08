import type { FC } from "react";
import type { AspectRefinement } from "@/lib/shop";
import styles from "./OfferFilters.module.css";

type AspectFiltersProps = {
  aspects: AspectRefinement[];
  selected: Record<string, string[]>;
  onToggle: (name: string, value: string) => void;
};

const FARBE_SWATCHES: Record<string, string> = {
  Apricot: "#e8926a",
  Beige: "#c6ad86",
  Blau: "#3d6fbf",
  Bordeaux: "#72243e",
  Braun: "#7a4e2d",
  Cotto: "#c4623a",
  Creme: "#f3e5c4",
  Flieder: "#c9a6d8",
  Gelb: "#e3c200",
  Gold: "#c6a03a",
  Grau: "#8d8d8d",
  Grün: "#3e7d46",
  Lila: "#7a4e9d",
  Mint: "#7dcec0",
  Natur: "#e4d5bc",
  Oliv: "#6d7334",
  Orange: "#e07020",
  Petrol: "#1d6e78",
  Pink: "#e45b93",
  Rosa: "#e9a3b5",
  Rot: "#c43737",
  Schwarz: "#222222",
  Türkis: "#2aa8b8",
  Violett: "#5e2f8a",
  Weiß: "#ffffff",
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
                    {entry.value}
                    {aspect.name === "Farbe" && FARBE_SWATCHES[entry.value] ? (
                      <span
                        className={styles.swatch}
                        style={{ backgroundColor: FARBE_SWATCHES[entry.value] }}
                        aria-hidden="true"
                      />
                    ) : null}{" "}
                    ({entry.count})
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
