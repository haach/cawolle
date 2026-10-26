export const producers = [
  {
    name: "Katia",
    href: "https://www.katia.com/",
    logo: "/producers/katia.png",
    category: "wolle",
  },
  {
    name: "Zitron",
    href: "https://www.atelierzitron.de/",
    logo: "/producers/zitron.png",
    category: "wolle",
  },
  {
    name: "LANG YARNS",
    href: "https://www.langyarns.com/",
    logo: "/producers/langyarns.png",
    category: "wolle",
  },
  {
    name: "addi",
    href: "https://www.addi.de/",
    logo: "/producers/addi.png",
    category: "nadeln",
  },
  {
    name: "Clover",
    href: "https://www.clover-mfg.com/de",
    logo: "/producers/clover.png",
    category: "nadeln",
  },
  {
    name: "plus H",
    href: "https://www.plus-h.de/",
    logo: "/producers/plus-h.png",
    category: "nadeln",
  },
  {
    name: "Holz & Stein",
    href: "https://holz-und-stein.de/",
    logo: "/producers/holz-und-stein.png",
    category: "nadeln",
  },
  {
    name: "Gütermann",
    href: "https://www.guetermann.com/",
    logo: "/producers/guetermann.png",
    category: "kurzwaren",
  },
  {
    name: "Anchor",
    href: "https://www.anchorcrafts.com/",
    logo: "/producers/anchor.png",
    category: "kurzwaren",
  },
  {
    name: "dill",
    href: "https://www.dill-buttons.com/",
    logo: "/producers/dill.png",
    category: "kurzwaren",
  },
] as const;

function brandName(name: string) {
  return name.replace(/\s+/g, " ").trim();
}

export const OTHER_BRAND = "Sonstige";

export function producerLogo(name: string) {
  const brand = brandName(name);
  return producers.find(
    (producer) =>
      brandName(producer.name).localeCompare(brand, "de", { sensitivity: "base" }) === 0,
  )?.logo;
}

export function listedBrand(name: string) {
  return producerLogo(name) ? name : OTHER_BRAND;
}
