import type { FC } from "react";
import type { OfferTeaser } from "@/lib/shop";
import { FramedPhoto } from "./FramedPhoto";
import { OfferMeta } from "./OfferMeta";
import styles from "./OfferCard.module.css";
import Link from "next/link";

type OfferCardProps = {
  offer: OfferTeaser;
};

export const OfferCard: FC<OfferCardProps> = ({ offer }) => (
  <Link href={`/shop/${encodeURIComponent(offer.id)}`} className={styles.card}>
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
