import { ExternalLink, Spacing, Typography } from "@/components/atoms";
import { BusinessAddress } from "@/components/BusinessAddress";
import { shareMetadata } from "@/lib/metadata";

export const metadata = shareMetadata({
  title: "Datenschutz",
  description:
    "Datenschutzerklärung der Cawolle: Kontaktformular, Server-Logfiles und Angebote, die wir von eBay abrufen und dorthin weiterleiten.",
  path: "/datenschutz",
});

export default function DatenschutzPage() {
  return (
    <Spacing alignItems="stretch">
      <Typography variant="h1">Datenschutz</Typography>
      <Typography variant="body">
        Wir verarbeiten personenbezogene Daten nur, soweit das für den Betrieb dieser Website, für
        Ihre Anfrage oder für die Anzeige unserer eBay-Angebote nötig ist. Kauf und Zahlung laufen
        nicht auf cawolle.de, sondern bei eBay.
      </Typography>

      <div>
        <Typography variant="h2">Verantwortliche</Typography>
        <BusinessAddress linkEmail />
        <Typography variant="body">
          Eine Datenschutzbeauftragte ist nicht bestellt. Für ein Geschäft dieser Größe sind wir
          dazu nicht verpflichtet.
        </Typography>
      </div>

      <div>
        <Typography variant="h2">Hosting und Server-Logfiles</Typography>
        <Typography variant="body">
          Beim Aufruf der Website verarbeitet der Server, auf dem die Seiten liegen, technisch
          erforderlich: IP-Adresse, Datum und Uhrzeit, aufgerufene Adresse, Referrer, Browsertyp und
          Betriebssystem. Das dient dem Betrieb, der Stabilität und der Abwehr von Missbrauch.
        </Typography>
        <Typography variant="body">
          Rechtsgrundlage ist Artikel 6 Absatz 1 Buchstabe f DSGVO. Die Logfiles löschen wir nach
          sieben Tagen, sofern wir sie nicht ausnahmsweise zur Aufklärung eines Angriffs benötigen.
        </Typography>
      </div>

      <div>
        <Typography variant="h2">Kontaktformular</Typography>
        <Typography variant="body">
          Wenn Sie uns schreiben, verarbeiten wir Name, E-Mail-Adresse, Telefonnummer, Betreff und
          Nachricht. Die Angaben gehen per E-Mail an uns. Unser Mailserver verarbeitet sie in
          unserem Auftrag, damit die Nachricht ankommt.
        </Typography>
        <Typography variant="body">
          Rechtsgrundlage ist Artikel 6 Absatz 1 Buchstabe b DSGVO, soweit es um eine Anfrage zu
          Ware oder Versand geht, sonst Artikel 6 Absatz 1 Buchstabe f DSGVO. Ohne diese Angaben
          können wir nicht antworten. Wir speichern die Korrespondenz, bis die Anfrage erledigt ist.
          Führt sie zu einem Auftrag, gelten die handels- und steuerrechtlichen Fristen, in der
          Regel sechs beziehungsweise zehn Jahre.
        </Typography>
      </div>

      <div>
        <Typography variant="h2">Angebote über eBay</Typography>
        <Typography variant="body">
          Unser Sortiment im Shop stammt von eBay. Unser Server ruft dafür Angebotsdaten ab, etwa
          Bezeichnung, Preis, Verfügbarkeit, Artikelnummer und Bild. In dieser Abfrage stehen keine
          Daten aus dem Kontaktformular und kein Kundenkonto. eBay sieht dabei die technische
          Anfrage unseres Servers.
        </Typography>
        <Typography variant="body">
          Bilder können direkt von eBay-Servern geladen werden. Ihr Browser übermittelt dann die
          IP-Adresse, den Zeitpunkt des Abrufs und die Adresse unserer Seite an eBay.
          Rechtsgrundlage ist Artikel 6 Absatz 1 Buchstabe f DSGVO. Wir wollen aktuelle Angebote
          zeigen, ohne sie doppelt zu pflegen.
        </Typography>
        <Typography variant="body">
          Sobald Sie ein Angebot öffnen, leiten wir Sie zu eBay weiter. Ab dann gilt die
          Datenschutzerklärung von eBay. Dort entstehen das Nutzerkonto, die Bestellung und die
          Zahlung. Diese Daten erheben wir auf cawolle.de nicht. eBay kann eigene Cookies setzen und
          Daten in den USA verarbeiten. Dafür nennt eBay geeignete Garantien, insbesondere den
          Angemessenheitsbeschluss zum EU-US Data Privacy Framework und Standardvertragsklauseln.
        </Typography>
        <Typography variant="body">
          Verantwortliche bei eBay ist die eBay GmbH, Albert-Einstein-Ring 2-6, 14532 Kleinmachnow.
          Die Hinweise von eBay stehen unter{" "}
          <ExternalLink href="https://www.ebay.de/help/policies/member-behaviour-policies/user-privacy-notice-privacy-policy?id=4260">
            ebay.de/Datenschutz
          </ExternalLink>
          .
        </Typography>
      </div>

      <div>
        <Typography variant="h2">Externe Links</Typography>
        <Typography variant="body">
          Links zu Herstellern und zu unserer Facebook-Seite öffnen die Website des jeweiligen
          Anbieters. Erst dann erhält dieser Ihre IP-Adresse. Wir binden keine Social-Media-Plugins
          ein und erfahren nicht, was Sie dort tun.
        </Typography>
      </div>

      <div>
        <Typography variant="h2">Reichweitenmessung</Typography>
        <Typography variant="body">
          Wir werten mit Vercel Web Analytics aus, welche Seiten aufgerufen werden. Es werden keine
          Cookies gesetzt. Besucher werden nur für einen Tag über einen Hash der Anfrage erkannt,
          nicht über mehrere Tage oder Websites. Erfasst werden die aufgerufene Seite, die
          verweisende Seite, ein ungefährer Standort sowie Gerät und Browser. Diese Angaben liegen
          uns nur zusammengefasst vor. Ein Klick auf den Link zu eBay wird in derselben Auswertung
          mitgezählt, mit Angebotsnummer, Marke, Seite und, falls vorhanden, dem Suchbegriff.
        </Typography>
        <Typography variant="body">
          Verarbeitet wird das durch die Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723,
          USA. Rechtsgrundlage ist Artikel 6 Absatz 1 Buchstabe f DSGVO. Wir wollen sehen, welche
          Seiten genutzt werden. Eine Übermittlung in die USA stützt Vercel auf den
          Angemessenheitsbeschluss zum EU-US Data Privacy Framework. Hinweise stehen unter{" "}
          <ExternalLink href="https://vercel.com/docs/analytics/privacy-policy">
            vercel.com/docs/analytics/privacy-policy
          </ExternalLink>
          .
        </Typography>
      </div>

      <div>
        <Typography variant="h2">Cookies</Typography>
        <Typography variant="body">
          Diese Website setzt keine Cookies für Reichweitenmessung oder Werbung. Technisch nötige
          Verbindungen speichern wir nicht als Profil. Cookies, die nach dem Wechsel zu eBay
          entstehen, setzt eBay.
        </Typography>
      </div>

      <div>
        <Typography variant="h2">Ihre Rechte</Typography>
        <Typography variant="body">Sie können von uns verlangen:</Typography>
        <ul>
          <li>
            <Typography variant="body">Auskunft über die Daten, die wir zu Ihnen haben,</Typography>
          </li>
          <li>
            <Typography variant="body">Berichtigung unrichtiger Daten,</Typography>
          </li>
          <li>
            <Typography variant="body">
              Löschung, soweit keine Aufbewahrungspflicht entgegensteht,
            </Typography>
          </li>
          <li>
            <Typography variant="body">Einschränkung der Verarbeitung,</Typography>
          </li>
          <li>
            <Typography variant="body">
              Herausgabe der Daten, die Sie uns gegeben haben, in einem üblichen Format,
            </Typography>
          </li>
          <li>
            <Typography variant="body">
              Widerspruch gegen eine Verarbeitung auf Grundlage von Artikel 6 Absatz 1 Buchstabe f
              DSGVO.
            </Typography>
          </li>
        </ul>
        <Typography variant="body">
          Eine Einwilligung holen wir für die hier beschriebenen Vorgänge nicht ein. Es gibt deshalb
          nichts, was Sie widerrufen müssten. Eine automatisierte Entscheidung im Sinne von Artikel
          22 DSGVO findet nicht statt.
        </Typography>
        <Typography variant="body">
          Beschwerden richten Sie an den Hessischen Beauftragten für Datenschutz und
          Informationsfreiheit, Gustav-Stresemann-Ring 1, 65189 Wiesbaden,{" "}
          <ExternalLink href="https://datenschutz.hessen.de">datenschutz.hessen.de</ExternalLink>.
        </Typography>
      </div>
    </Spacing>
  );
}
