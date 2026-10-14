import type { FC } from "react";
import type { OfferTeaser } from "@/lib/shop";
import { OfferCard } from "./OfferCard";
import styles from "./OfferList.module.css";

type OfferListProps = {
  offers: OfferTeaser[];
  filterQuery: string;
};

export const OfferList: FC<OfferListProps> = ({ offers, filterQuery }) => (
  <div className={styles.frame}>
    <ul className={styles.list}>
      {offers.map((offer) => (
        <li key={offer.id} className={styles.item}>
          <OfferCard offer={offer} filterQuery={filterQuery} />
        </li>
      ))}
    </ul>
  </div>
);
