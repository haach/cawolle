import Link from "next/link";
import { Button, Typography } from "@/components/atoms";
import { Section } from "@/components/Section";
import styles from "./OnlineShop.module.css";

export function OnlineShop() {
  return (
    <Section title="Online Wollgeschäft Cawolle" heading="h1" align="center">
      <Typography variant="body">
        Unser Ladengeschäft in Biebergemünd hat zum Ende des Jahres 2024 geschlossen. Cawolle ist
        jetzt ein reiner Online-Shop: dieselbe Auswahl an Wolle, Garnen und Handarbeitszubehör,
        bequem nach Hause geliefert.
      </Typography>
      <Typography variant="body">
        Stöbern Sie in unserem <Link href="/shop">Shop</Link>, oder schreiben Sie uns, wenn Sie ein
        bestimmtes Garn, eine Nadelstärke oder Knöpfe zur Jacke suchen. Wir beraten Sie gerne bei
        Material und Modell.
      </Typography>
      <div className={styles.actions}>
        <Button href="/shop">Zum Shop</Button>
        <a href="#wolle">Mehr zum Sortiment</a>
      </div>
    </Section>
  );
}
