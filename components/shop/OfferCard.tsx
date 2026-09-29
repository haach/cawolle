import Image from "next/image";
import Link from "next/link";
import type { OfferTeaser } from "@/lib/shop";
import styles from "./OfferCard.module.css";

export function OfferCard({ offer }: { offer: OfferTeaser }) {
  return (
    <Link href={`/shop/${encodeURIComponent(offer.id)}`} className={styles.card}>
      <span className={styles.media}>
        {offer.imageUrl ? (
          <Image src={offer.imageUrl} alt="" fill sizes="(max-width: 560px) 100vw, 360px" />
        ) : (
          <span className={styles.placeholder}>Kein Foto</span>
        )}
      </span>
      <span className={styles.body}>
        <span className={styles.title}>{offer.title}</span>
        {offer.price && <span className={styles.price}>{offer.price}</span>}
        {offer.condition && <span className={styles.condition}>{offer.condition}</span>}
      </span>
    </Link>
  );
}
