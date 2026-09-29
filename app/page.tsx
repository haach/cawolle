import { Hero } from "@/components/Hero";
import { JsonLd } from "@/components/JsonLd";
import { MoodBand } from "@/components/MoodBand";
import { OnlineShop } from "@/components/OnlineShop";
import { Sortiment } from "@/components/Sortiment";
import { shareMetadata } from "@/lib/metadata";
import { organization, website } from "@/lib/schema";
import { siteConfig } from "@/services/site";
import styles from "./page.module.css";

export const metadata = shareMetadata({
  description: siteConfig.description,
  path: "/",
});

export default function HomePage() {
  return (
    <div className={styles.page}>
      <JsonLd data={[organization(), website()]} />
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
