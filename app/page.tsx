import type { Metadata } from "next";
import { Hero } from "@/components/Hero";
import { MoodBand } from "@/components/MoodBand";
import { OnlineShop } from "@/components/OnlineShop";
import { Sortiment } from "@/components/Sortiment";
import styles from "./page.module.css";

export const metadata: Metadata = {
  description:
    "Cawolle ist jetzt ein Online-Wollgeschäft. Garne, Nadeln und Kurzwaren von Katia, Zitron, LANG YARNS, addi und weiteren Manufakturen.",
};

export default function HomePage() {
  return (
    <div className={styles.page}>
      <Hero />
      <OnlineShop />
      <MoodBand
        image="/mood/werke.jpg"
        kicker="Handarbeit"
        quote="„Werke der Hand sind Zeugnisse der Seele“"
      />
      <Sortiment />
      <MoodBand image="/mood/wolle.jpg" kicker="Qualität" quote="Wolle ist nicht gleich Wolle." />
    </div>
  );
}
