export const siteConfig = {
  name: "Cawolle",
  owner: "Bettina Achenbach",
  description:
    "Cawolle - ein Online-Wollgeschäft. Garne, Nadeln und Kurzwaren von Katia, Zitron, LANG YARNS, addi und weiteren Manufakturen.",
  url: "https://cawolle.de",
  email: "info@cawolle.de",
  facebook: "https://www.facebook.com/Cawolle/",
  logo: "/logo.png",
  shopDescription: "Aktuelle Angebote von Cawolle. Bestellung und Zahlung laufen über eBay.",
  address: {
    street: "Neue Str. 2",
    postalCode: "63584",
    locality: "Gründau",
    country: "DE",
  },
} as const;

export const mainNav = [
  { href: "/", label: "Startseite" },
  { href: "/shop", label: "Shop" },
  { href: "/kontakt", label: "Kontakt" },
] as const;

export const footerNav = [
  { href: "/impressum", label: "Impressum" },
  { href: "/datenschutz", label: "Datenschutz" },
] as const;

export function publicEmail() {
  return siteConfig.email.replace("@", "[at]");
}
