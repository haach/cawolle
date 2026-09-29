import { Spacing, Typography } from "@/components/atoms";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { shareMetadata } from "@/lib/metadata";
import { organization } from "@/lib/schema";
import { siteConfig } from "@/services/site";

export const metadata = shareMetadata({
  title: "Impressum",
  description: `Anbieterkennzeichnung von ${siteConfig.name}, Inhaberin Bettina Achenbach, ${siteConfig.address.street}, ${siteConfig.address.postalCode} ${siteConfig.address.locality}.`,
  path: "/impressum",
});

export default function ImpressumPage() {
  return (
    <Spacing>
      <JsonLd data={organization({ address: true, email: true })} />
      <Typography variant="h1">Impressum</Typography>
      <div>
        <Typography variant="body">
          {siteConfig.name}
          <br />
          Inh. Bettina Achenbach
          <br />
          {siteConfig.address.street} {siteConfig.address.postalCode} {siteConfig.address.locality}
          <br />
          E-Mail: {siteConfig.email.replace("@", "[at]")}
        </Typography>
      </div>
      <div>
        <Typography variant="h2">Haftungshinweis</Typography>
        <Typography variant="body">
          Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte
          externer Links. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber
          verantwortlich.
        </Typography>
      </div>
      <div>
        <Typography variant="h2">Bankverbindung</Typography>
        <Typography variant="body">IBAN: DE 73 5059 2200 0006 0364 65</Typography>
      </div>
      <div>
        <Typography variant="h2">Design</Typography>
        <Link href="https://iamhanna.de" target="_blank" rel="noopener noreferrer">
          Hanna Achenbach
        </Link>
      </div>
    </Spacing>
  );
}
