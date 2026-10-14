import type { FC } from "react";
import { withFilterQuery, type OfferTeaser } from "@/lib/shop";
import { FramedPhoto } from "./FramedPhoto";
import { OfferMeta } from "./OfferMeta";
import styles from "./OfferCard.module.css";
import Link from "next/link";

type OfferCardProps = {
  offer: OfferTeaser;
  filterQuery: string;
};

export const OfferCard: FC<OfferCardProps> = ({ offer, filterQuery }) => (
  <Link
    href={withFilterQuery(`/shop/${encodeURIComponent(offer.id)}`, filterQuery)}
    className={styles.card}
  >
    <span className={styles.media}>
      {offer.imageUrl ? (
        <FramedPhoto src={offer.imageUrl} alt="" sizes="(max-width: 560px) 100vw, 360px" />
      ) : (
        <span className={styles.placeholder}>Kein Foto</span>
      )}
    </span>
    <span className={styles.body}>
      <span className={styles.title}>{offer.title}</span>
      <OfferMeta
        price={offer.price}
        condition={offer.condition}
        priceClassName={styles.price}
        conditionClassName={styles.condition}
      />
    </span>
  </Link>
);
