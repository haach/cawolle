import Image from "next/image";
import { Typography } from "@/components/atoms";
import styles from "./MoodBand.module.css";

type MoodBandProps = {
  image: string;
  quote: string;
  kicker: string;
};

export function MoodBand({ image, quote, kicker }: MoodBandProps) {
  return (
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
}
