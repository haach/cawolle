import type { FC } from "react";
import { Spacing, Typography } from "@/components/atoms";
import { displayHeading, normalizeOffer, pageTitle, summaryLines } from "@/lib/normalize";
import { withFilterQuery, type CatalogOffer } from "@/lib/shop";
import { FramedPhoto } from "./FramedPhoto";
import { OfferMeta } from "./OfferMeta";
import styles from "./OfferCard.module.css";
import Link from "next/link";

type OfferCardProps = {
  offer: CatalogOffer;
  filterQuery: string;
};

export const OfferCard: FC<OfferCardProps> = ({ offer, filterQuery }) => {
  const product = normalizeOffer(offer);
  const lines = summaryLines(product).filter(
    (line) => line !== "Farbverlauf" || product.colorGroups.length === 0,
  );

  return (
    <Link
      href={withFilterQuery(`/shop/${encodeURIComponent(offer.id)}`, filterQuery)}
      className={styles.card}
    >
      <span className={styles.media}>
        {offer.imageUrl ? (
          <FramedPhoto
            src={offer.imageUrl}
            alt={pageTitle(product)}
            sizes="(max-width: 560px) 100vw, 360px"
          />
        ) : (
          <Typography as="span" variant="small" color="muted">
            Kein Foto
          </Typography>
        )}
      </span>
      <Spacing space={5} alignItems="stretch" className={styles.body}>
        <span className={styles.title}>{displayHeading(product)}</span>
        {lines.map((line) => (
          <Typography key={line} as="span" variant="small">
            {line}
          </Typography>
        ))}
        <OfferMeta price={offer.price} condition={offer.condition} />
      </Spacing>
    </Link>
  );
};
