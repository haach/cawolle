import type { Metadata } from "next";
import { Spacing, Typography } from "@/components/atoms";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Impressum",
};

export default function ImpressumPage() {
  return (
    <Spacing>
      <Typography variant="h1">Impressum</Typography>
      <div>
        <Typography variant="body">
          Cawolle
          <br />
          Inh. Bettina Achenbach
          <br />
          Neue Str. 2 63584 Gründau
          <br />
          E-Mail: info[at]cawolle.de
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
