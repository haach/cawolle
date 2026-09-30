import Image from "next/image";
import type { FC } from "react";
import { Typography } from "@/components/atoms";
import styles from "./MoodBand.module.css";

type MoodBandProps = {
  image: string;
  quote: string;
  kicker: string;
};

export const MoodBand: FC<MoodBandProps> = ({ image, quote, kicker }) => (
  <section className={styles.band}>
    <Image src={image} alt="" fill sizes="100vw" className={styles.background} />
    <div className={styles.scrim} />
    <div className={styles.content}>
      <Typography variant="small" color="inverse" className={styles.kicker}>
        {kicker}
      </Typography>
      <Typography variant="h2" as="p" color="inverse" italic className={styles.quote}>
        {quote}
      </Typography>
    </div>
  </section>
);
