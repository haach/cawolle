import { useEffect, useId, useRef, useState, type FC } from "react";
import { COLORWAY_ASPECT, FARBVERLAUF, type AspectRefinement, type AspectValue } from "@/lib/shop";
import styles from "./OfferFilters.module.css";
import { Spacing } from "../atoms/Spacing";

type AspectFiltersProps = {
  aspects: AspectRefinement[];
  selected: Record<string, string[]>;
  colorway: string;
  onToggle: (name: string, value: string) => void;
  onColorway: (value: string) => void;
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
  [FARBVERLAUF]:
    "linear-gradient(135deg, #c43737 0%, #e9a3b5 34%, #e3c200 52%, #3e7d46 74%, #3d6fbf 100%)",
};

type FilterOptionProps = {
  checked: boolean;
  text: string;
  count: number;
  swatch?: string;
  onToggle: () => void;
};

const FilterOption: FC<FilterOptionProps> = ({ checked, text, count, swatch, onToggle }) => (
  <label className={styles.option}>
    <input type="checkbox" checked={checked} onChange={onToggle} />
    <span>
      {text}
      {swatch ? (
        <span className={styles.swatch} style={{ background: swatch }} aria-hidden="true" />
      ) : null}{" "}
      ({count})
    </span>
  </label>
);

type DisclosureProps = {
  open: boolean;
  panelId: string;
  label: string;
  onClick: () => void;
};

const Disclosure: FC<DisclosureProps> = ({ open, panelId, label, onClick }) => (
  <button
    type="button"
    className={styles.disclosure}
    aria-expanded={open}
    aria-controls={panelId}
    aria-label={open ? `${label} einklappen` : `${label} ausklappen`}
    onClick={onClick}
  >
    <svg className={styles.disclosureRing} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="1.25" y="1.25" width="21.5" height="21.5" rx="4" pathLength="1" />
    </svg>
    <span className={styles.disclosureMark} />
  </button>
);

type WeightGroupProps = {
  aspectName: string;
  entry: AspectValue;
  selected: string[];
  onToggle: (name: string, value: string) => void;
};

const WeightGroup: FC<WeightGroupProps> = ({ aspectName, entry, selected, onToggle }) => {
  const panelId = useId();
  const children = entry.children ?? [];
  const childSelected = children.some((child) => selected.includes(child.value));
  const [explicitOpen, setExplicitOpen] = useState<boolean | null>(null);
  const open = explicitOpen ?? childSelected;

  return (
    <li>
      <Spacing dir="row" space={5}>
        <FilterOption
          checked={selected.includes(entry.value)}
          text={entry.label ?? entry.value}
          count={entry.count}
          onToggle={() => onToggle(aspectName, entry.value)}
        />
        {children.length > 0 && (
          <Disclosure
            open={open}
            panelId={panelId}
            label={entry.value}
            onClick={() => setExplicitOpen(!open)}
          />
        )}
      </Spacing>
      {open && children.length > 0 && (
        <ul id={panelId} className={styles.lengths}>
          {children.map((child) => (
            <li key={child.value}>
              <FilterOption
                checked={selected.includes(child.value)}
                text={child.label ?? child.value}
                count={child.count}
                onToggle={() => onToggle(aspectName, child.value)}
              />
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

type ColorwayGroupProps = {
  colorway: string;
  onColorway: (value: string) => void;
};

const ColorwayGroup: FC<ColorwayGroupProps> = ({ colorway, onColorway }) => {
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [explicitOpen, setExplicitOpen] = useState<boolean | null>(null);
  const open = explicitOpen ?? colorway.length > 0;

  useEffect(() => {
    if (open) panelRef.current?.scrollIntoView({ block: "nearest" });
  }, [open]);

  return (
    <li className={styles.colorwayItem}>
      <Spacing dir="row" space={5}>
        <span className={styles.colorwayHeading}>{COLORWAY_ASPECT}</span>
        <Disclosure
          open={open}
          panelId={panelId}
          label={COLORWAY_ASPECT}
          onClick={() => setExplicitOpen(!open)}
        />
      </Spacing>
      {open && (
        <div id={panelId} ref={panelRef} className={styles.lengths}>
          <input
            className={styles.control}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            name="colorway"
            aria-label={COLORWAY_ASPECT}
            value={colorway}
            placeholder="z. B. 580"
            onChange={(event) => onColorway(event.target.value)}
          />
        </div>
      )}
    </li>
  );
};

export const AspectFilters: FC<AspectFiltersProps> = ({
  aspects,
  selected,
  colorway,
  onToggle,
  onColorway,
}) => (
  <>
    {aspects.map((aspect) => {
      const chosen = selected[aspect.name] ?? [];
      const grouped = aspect.values.some((entry) => entry.children);
      const farbverlauf =
        aspect.name === "Farbe"
          ? aspect.values.find((entry) => entry.value === FARBVERLAUF)
          : undefined;
      const values = farbverlauf
        ? aspect.values.filter((entry) => entry.value !== FARBVERLAUF)
        : aspect.values;
      return (
        <fieldset key={aspect.name} className={styles.group}>
          <legend className={styles.label}>{aspect.label ?? aspect.name}</legend>
          <ul className={grouped ? `${styles.values} ${styles.stack}` : styles.values}>
            {values.map((entry) =>
              entry.children ? (
                <WeightGroup
                  key={entry.value}
                  aspectName={aspect.name}
                  entry={entry}
                  selected={chosen}
                  onToggle={onToggle}
                />
              ) : (
                <li key={entry.value}>
                  <FilterOption
                    checked={chosen.includes(entry.value)}
                    text={entry.label ?? entry.value}
                    count={entry.count}
                    swatch={aspect.name === "Farbe" ? FARBE_SWATCHES[entry.value] : undefined}
                    onToggle={() => onToggle(aspect.name, entry.value)}
                  />
                </li>
              ),
            )}
            {farbverlauf && (
              <li className={styles.colorwayItem}>
                <FilterOption
                  checked={chosen.includes(farbverlauf.value)}
                  text={farbverlauf.label ?? farbverlauf.value}
                  count={farbverlauf.count}
                  swatch={FARBE_SWATCHES[farbverlauf.value]}
                  onToggle={() => onToggle(aspect.name, farbverlauf.value)}
                />
              </li>
            )}
            {farbverlauf && <ColorwayGroup colorway={colorway} onColorway={onColorway} />}
          </ul>
        </fieldset>
      );
    })}
  </>
);
