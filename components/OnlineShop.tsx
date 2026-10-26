import Image from "next/image";
import Link from "next/link";
import type { FC } from "react";
import { Button, Spacing, Typography } from "@/components/atoms";
import { Section } from "@/components/Section";
import styles from "./OnlineShop.module.css";

export const OnlineShop: FC = () => (
  <Section title="Das Ladengeschäft" heading="h2" align="center" wide>
    <div className={styles.split}>
      <Image
        src="/package.png"
        alt="Mit Bindfaden verschnürtes Paket und Cawolle-Anhänger"
        width={1200}
        height={909}
        className={styles.package}
      />
      <Spacing space={20}>
        <Typography variant="body">
          Unser Ladengeschäft in Biebergemünd hat zum Ende des Jahres 2024 geschlossen.
        </Typography>
        <Typography variant="body">
          Wenn Sie ein bestimmtes Garn, eine Nadelstärke oder Knöpfe zur Jacke suchen, schreiben Sie
          uns. Wir helfen gerne bei Material und Modell.
        </Typography>
        <Spacing dir="row" alignItems="center" space={20} className={styles.actions}>
          <Button href="/kontakt">Frage zum Garn</Button>
          <Link href="/shop">Alle Angebote</Link>
        </Spacing>
      </Spacing>
    </div>
  </Section>
);
