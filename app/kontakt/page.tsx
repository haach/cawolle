import Link from "next/link";
import { Spacing, Typography } from "@/components/atoms";
import { ContactForm } from "@/components/ContactForm";
import { JsonLd } from "@/components/JsonLd";
import { shareMetadata } from "@/lib/metadata";
import { breadcrumb, contactPage, organization } from "@/lib/schema";
import { siteConfig } from "@/services/site";

export const metadata = shareMetadata({
  title: "Kontakt",
  description: "Fragen zu Garn, Nadeln oder einer Bestellung? Schreiben Sie Cawolle direkt.",
  path: "/kontakt",
});

export default function KontaktPage() {
  return (
    <Spacing>
      <JsonLd
        data={[
          contactPage(),
          organization({ email: true, sameAs: siteConfig.facebook }),
          breadcrumb([
            { name: "Startseite", path: "/" },
            { name: "Kontakt", path: "/kontakt" },
          ]),
        ]}
      />
      <Typography variant="h1">Kontakt</Typography>
      <div>
        <Typography variant="body">
          Wenn Sie Fragen oder Anregungen haben können Sie sich gerne per E-Mail mit uns in
          Verbindung setzen.
        </Typography>
        <Spacing dir="row">
          <Link href="mailto:info@cawolle.de">info[at]cawolle.de</Link>
          <Link href={siteConfig.facebook} target="_blank" rel="noopener noreferrer">
            Facebook
          </Link>
        </Spacing>
      </div>
      <div>
        <Typography variant="h2">Schreiben Sie uns direkt</Typography>
        <ContactForm />
      </div>
    </Spacing>
  );
}
