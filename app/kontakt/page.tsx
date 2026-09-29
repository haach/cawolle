import type { Metadata } from "next";
import Link from "next/link";
import { Spacing, Typography } from "@/components/atoms";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Kontakt",
};

export default function KontaktPage() {
  return (
    <Spacing>
      <Typography variant="h1">Kontakt</Typography>
      <div>
        <Typography variant="body">
          Wenn Sie Fragen oder Anregungen haben können Sie sich gerne per E-Mail mit uns in
          Verbindung setzen.
        </Typography>
        <Spacing dir="row">
          <Link href="mailto:info@cawolle.de">info[at]cawolle.de</Link>
          <Link href="https://www.facebook.com/Cawolle/" target="_blank" rel="noopener noreferrer">
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
