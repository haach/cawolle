import Image from "next/image";
import { Button, Typography } from "@/components/atoms";
import { Section } from "@/components/Section";
import { producers } from "@/services/producers";
import styles from "./Sortiment.module.css";

const sections = [
  {
    id: "wolle",
    title: "Wolle",
    tone: "beige",
    paragraphs: [
      "Kratzwolle und beliebige Farben waren gestern. Bei uns finden Sie Baumwolle, Viskose, Leinen, Seide, Merino, Alpaka, Mohair, Kid Mohair und Lace, in Unifarben, Farbverläufen und handgefärbten Unikaten. Naturmaterialien und ökologisch hergestellte Garne liegen uns besonders am Herzen.",
      "Die Auswahl pflegen wir über Fachliteratur, Hausmessen der Hersteller und die internationale Fachmesse h+h in Köln.",
      "Katia steht für luftige Ideen aus Spanien. Zitron färbt in Deutschland nach Öko-Tex Standard 100, Produktklasse 1. LANG YARNS verbindet über hundert Jahre Familienunternehmen mit aktuellen Handstrickgarnen aus der Schweiz.",
    ],
  },
  {
    id: "nadeln",
    title: "Nadeln",
    tone: "plain",
    paragraphs: [
      "Mit Metall, Holz oder Bambus laufen die Maschen flüssig. addi fertigt in Deutschland, Clover und plus H ergänzen das Zubehör. Die Nadeln von Holz & Stein entstehen aus Restholz der Musikinstrumentenfertigung: hart, glatt und jedes Stück ein wenig anders.",
    ],
  },
  {
    id: "kurzwaren",
    title: "Kurzwaren",
    tone: "beige",
    paragraphs: [
      "Gütermann Nähgarn, Stickgarn von Anchor und Knöpfe von dill. Seit 1924 entsteht in der Knopfstadt Bärnau eine Mischung aus klassischen und modernen Knöpfen, passend zu Jacke, Mantel und selbstgestrickten Stücken.",
    ],
  },
] as const;

export function Sortiment() {
  return (
    <div id="sortiment">
      {sections.map((section) => (
        <Section key={section.id} id={section.id} title={section.title} tone={section.tone}>
          {section.paragraphs.map((paragraph) => (
            <Typography key={paragraph} variant="body" className={styles.copy}>
              {paragraph}
            </Typography>
          ))}
          <ul className={styles.logos}>
            {producers
              .filter((producer) => producer.category === section.id)
              .map((producer) => (
                <li key={producer.name}>
                  <a
                    className={styles.tile}
                    href={producer.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${producer.name}, Website des Herstellers`}
                  >
                    <Image
                      src={producer.logo}
                      alt=""
                      width={160}
                      height={91}
                      className={styles.logo}
                    />
                  </a>
                </li>
              ))}
          </ul>
          {section.id === "kurzwaren" ? <Button href="/shop">Zum Shop</Button> : null}
        </Section>
      ))}
    </div>
  );
}
