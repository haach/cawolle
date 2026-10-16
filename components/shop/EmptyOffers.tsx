import { useId, type FC } from "react";
import { Button, Typography } from "../atoms";
import styles from "./EmptyOffers.module.css";

type EmptyOffersProps = {
  onClear: () => void;
};

export const EmptyOffers: FC<EmptyOffersProps> = ({ onClear }) => {
  const rawId = useId().replaceAll(":", "");
  const basketClipId = `empty-basket-${rawId}`;
  const yarnClipId = `empty-yarn-${rawId}`;

  return (
    <div className={styles.empty} aria-live="polite" aria-atomic="true">
      <svg className={styles.art} viewBox="0 0 320 200" fill="none" aria-hidden="true">
        <circle className={styles.stage} cx="160" cy="100" r="88" />
        <ellipse className={styles.shadow} cx="176" cy="174" rx="74" ry="8" />
        <g clipPath={`url(#${basketClipId})`}>
          <path className={styles.basket} d="M150 122h120c0 40-26 54-60 54s-60-14-60-54z" />
          <path className={styles.weave} d="M156 138c18 8 36 8 54 0s36-8 54 0" />
          <path className={styles.weave} d="M154 152c20 8 38 8 58 0s38-8 58 0" />
          <path className={styles.weave} d="M168 166c14 6 28 6 42 0s28-6 42 0" />
          <path className={styles.weave} d="M178 126c-6 16-4 32 2 46" />
          <path className={styles.weave} d="M210 126c0 16 2 32 2 46" />
          <path className={styles.weave} d="M242 126c6 14 4 30-2 44" />
        </g>
        <ellipse className={styles.rim} cx="210" cy="122" rx="60" ry="14" />
        <ellipse className={styles.hollow} cx="210" cy="126" rx="42" ry="8" />
        <g clipPath={`url(#${yarnClipId})`}>
          <circle className={styles.yarn} cx="112" cy="104" r="38" />
          <ellipse className={styles.highlight} cx="98" cy="88" rx="16" ry="11" />
          <path className={`${styles.wrap} ${styles.wrapTan}`} d="M76 84c24-20 52-16 70 12" />
          <path className={`${styles.wrap} ${styles.wrapLight}`} d="M74 104c26-14 52-4 72 16" />
          <path className={`${styles.wrap} ${styles.wrapCream}`} d="M82 122c22 12 44 6 60-14" />
          <path className={`${styles.wrap} ${styles.wrapTan}`} d="M98 68c-10 26 2 48 24 64" />
          <path className={`${styles.wrap} ${styles.wrapDeep}`} d="M130 70c12 24 6 46-16 62" />
        </g>
        <path className={styles.strand} d="M142 122c18 16 28 8 40 4 14-4 12 12-2 14" />
        <circle className={styles.strandEnd} cx="180" cy="140" r="2.5" />
        <defs>
          <clipPath id={basketClipId}>
            <path d="M150 128h120c0 36-24 46-60 46s-60-10-60-46z" />
          </clipPath>
          <clipPath id={yarnClipId}>
            <circle cx="112" cy="104" r="36" />
          </clipPath>
        </defs>
      </svg>
      <div className={styles.copy}>
        <Typography variant="h3" as="p">
          Keine Angebote für diese Auswahl.
        </Typography>
        <Typography variant="body">Passen Sie die Filter oder den Suchbegriff an.</Typography>
      </div>
      <Button onClick={onClear}>Auswahl zurücksetzen</Button>
    </div>
  );
};
