export const siteConfig = {
  name: "Cawolle",
  description: "Cawolle",
  url: "https://cawolle.de",
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
