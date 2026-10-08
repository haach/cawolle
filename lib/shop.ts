export type OfferTeaser = {
  id: string;
  title: string;
  price: string | null;
  imageUrl: string | null;
  condition: string | null;
};

export type CatalogOffer = OfferTeaser & {
  categoryId: string | null;
  categoryName: string | null;
  aspects: { name: string; value: string }[];
};

export type ShopCatalog = {
  syncedAt: string;
  offers: CatalogOffer[];
};

export type AspectRefinement = {
  name: string;
  values: { value: string; count: number }[];
};

export type OfferDetail = {
  id: string;
  title: string;
  price: string | null;
  priceValue: string | null;
  priceCurrency: string | null;
  condition: string | null;
  aspects: { name: string; value: string }[];
  images: string[];
  descriptionHtml: string;
  itemWebUrl: string | null;
};

export function parseAspectParams(params: URLSearchParams): Record<string, string[]> {
  const aspects: Record<string, string[]> = {};

  for (const entry of params.getAll("aspect")) {
    const separator = entry.indexOf(":");
    if (separator <= 0) continue;
    const name = entry.slice(0, separator);
    const value = entry.slice(separator + 1);
    if (!value) continue;
    aspects[name] = [...(aspects[name] ?? []), value];
  }

  return aspects;
}

export function withQuery(params: URLSearchParams, value: string) {
  const next = new URLSearchParams(params);
  if (value) next.set("q", value);
  else next.delete("q");
  return next;
}

export function withoutAspects(params: URLSearchParams) {
  const next = new URLSearchParams(params);
  next.delete("aspect");
  return next;
}

export function withToggledAspect(params: URLSearchParams, name: string, value: string) {
  const current = parseAspectParams(params);
  const values = current[name] ?? [];
  const nextValues = values.includes(value)
    ? values.filter((entry) => entry !== value)
    : [...values, value];
  const selected = { ...current, [name]: nextValues };
  const next = new URLSearchParams(params);
  next.delete("aspect");

  for (const [aspectName, aspectValues] of Object.entries(selected)) {
    for (const aspectValue of aspectValues) {
      next.append("aspect", `${aspectName}:${aspectValue}`);
    }
  }

  return next;
}

const FILTER_ASPECTS = ["Material", "Farbe", "Marke", "Produktart", "Lauflänge", "Stil", "Form"];

const filterAspectOrder = new Map(FILTER_ASPECTS.map((name, index) => [name, index]));

// A value belongs to every group whose name it contains: Silbergrau → Grau, Seide mit Baumwolle → Seide and Baumwolle.
// Shade names from yarn color cards join that group even when the group name is absent: Marine → Blau, Ocker → Gelb, Rose → Rosa.
// Guards are longer color words that only contain a shorter shade by accident: Frost is not Rost, Primrose is not Rose.
const FARBE_GUARDS = ["Frost", "Primrose", "Mediterranean", "Mangold"];
const FARBE_MEMBERS = {
  Apricot: ["Pfirsich", "Peach"],
  Beige: ["Camel", "Sand", "Bast", "Leinen", "Linen", "Haut", "Nude"],
  Blau: [
    "Marine",
    "Navy",
    "Jeans",
    "Denim",
    "Kobalt",
    "Cobalt",
    "Azur",
    "Indigo",
    "Royal",
    "Himmel",
    "Saphir",
    "Sapphire",
    "Ultramarin",
    "Kornblume",
    "Fjord",
    "Bleu",
    "Blue",
    "Mediterranean",
  ],
  Bordeaux: ["Burgund"],
  Braun: [
    "Schlamm",
    "Schoko",
    "Chocolate",
    "Mokka",
    "Mocha",
    "Kakao",
    "Cocoa",
    "Kaffee",
    "Coffee",
    "Espresso",
    "Cappuccino",
    "Kastanie",
    "Chestnut",
    "Marone",
    "Zimt",
    "Cinnamon",
    "Nougat",
    "Cognac",
    "Karamell",
    "Caramel",
    "Kupfer",
    "Copper",
    "Bronze",
    "Umbra",
    "Sepia",
    "Tabak",
    "Tobacco",
    "Nuss",
    "Mahagoni",
    "Lehm",
    "Brown",
  ],
  Cotto: ["Terra"],
  Creme: [
    "Vanille",
    "Eierschale",
    "Elfenbein",
    "Ivory",
    "Champagne",
    "Magnolie",
    "Magnolia",
    "Sahne",
    "Cream",
  ],
  Flieder: ["Lavendel", "Lavender"],
  Gelb: [
    "Ocker",
    "Ochre",
    "Ocher",
    "Senf",
    "Mustard",
    "Zitron",
    "Lemon",
    "Limone",
    "Kanarien",
    "Safran",
    "Mais",
    "Curry",
    "Honig",
    "Sonne",
    "Raps",
    "Primrose",
    "Yellow",
  ],
  Gold: ["Bernstein", "Amber", "Messing", "Brass"],
  Grau: [
    "Anthrazit",
    "Charcoal",
    "Graphit",
    "Asche",
    "Silber",
    "Silver",
    "Platin",
    "Maus",
    "Elefant",
    "Nebel",
    "Rauch",
    "Schiefer",
    "Slate",
    "Beton",
    "Zement",
    "Taupe",
    "Stahl",
    "Greige",
    "Grey",
    "Gray",
  ],
  Grün: [
    "Apfel",
    "Gras",
    "Moos",
    "Moss",
    "Tanne",
    "Smaragd",
    "Emerald",
    "Kiwi",
    "Pistazie",
    "Pistachio",
    "Salbei",
    "Sage",
    "Jade",
    "Eukalyptus",
    "Eucalyptus",
    "Avocado",
    "Farn",
    "Lime",
    "Mangold",
    "Schilf",
    "Gruen",
    "Green",
  ],
  Lila: ["Orchid"],
  Mint: ["Minz"],
  Natur: ["Ecru", "Ekru", "Ungefärbt"],
  Oliv: ["Kaki", "Khaki"],
  Orange: [
    "Mandarine",
    "Tangerine",
    "Koralle",
    "Coral",
    "Lachs",
    "Salmon",
    "Mango",
    "Papaya",
    "Rost",
    "Rust",
  ],
  Petrol: ["Teal"],
  Pink: ["Fuchsia", "Fuchsie", "Magenta", "Zyklam", "Cyclam", "Himbeer", "Raspberry", "Flamingo"],
  Rosa: ["Rose", "Malve", "Mauve", "Blush", "Azalee", "Puder"],
  Rot: [
    "Kirsch",
    "Chili",
    "Chilli",
    "Tomate",
    "Karmin",
    "Scharlach",
    "Rubin",
    "Ruby",
    "Ziegel",
    "Amarant",
    "Erdbeere",
    "Johannisbeere",
    "Red",
  ],
  Schwarz: ["Kohle", "Onyx", "Ebenholz", "Ebony", "Obsidian", "Black"],
  Türkis: ["Aqua", "Cyan", "Zyan", "Turquoise", "Tuerkis", "Karibik", "Lagune"],
  Violett: [
    "Pflaume",
    "Plum",
    "Aubergine",
    "Brombeer",
    "Amethyst",
    "Purpur",
    "Purple",
    "Violet",
    "Viola",
    "Blaubeere",
    "Heidelbeere",
  ],
  Weiß: ["Schnee", "Snow", "White", "Kreide"],
} as const;

const ASPECT_GROUPS: Record<string, string[]> = {
  Material: [
    "Alpaca",
    "Baumwolle",
    "Cashmere",
    "Leinen",
    "Merino",
    "Mohair",
    "Polyacryl",
    "Seide",
    "Sockengarne",
  ],
  Farbe: Object.keys(FARBE_MEMBERS),
};

const ASPECT_ALIASES: Record<string, Record<string, string>> = {
  Material: {
    Acryl: "Polyacryl",
    Alpaka: "Alpaca",
    Kaschmir: "Cashmere",
    Sockengarn: "Sockengarne",
  },
  Farbe: Object.fromEntries(
    Object.entries(FARBE_MEMBERS).flatMap(([group, members]) =>
      members.map((member) => [member, group]),
    ),
  ),
};

function normalizeLabel(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("de")
    .replaceAll("ß", "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const normalizedAspectGroups = new Map(
  Object.entries(ASPECT_GROUPS).map(([aspect, groups]) => [
    aspect,
    {
      groups: groups.map((name) => ({ name, normalized: normalizeLabel(name) })),
      aliases: Object.entries(ASPECT_ALIASES[aspect] ?? {}).map(([alias, group]) => ({
        alias: normalizeLabel(alias),
        group,
      })),
      guards: (aspect === "Farbe" ? FARBE_GUARDS : []).map((guard) => normalizeLabel(guard)),
    },
  ]),
);

function groupedValues(aspectName: string, value: string) {
  const grouping = normalizedAspectGroups.get(aspectName);
  if (!grouping) return [value];

  const normalized = normalizeLabel(value);
  const matches = new Set(
    grouping.groups
      .filter((group) => containsUnguarded(normalized, group.normalized, grouping.guards))
      .map((group) => group.name),
  );
  for (const alias of grouping.aliases) {
    if (containsUnguarded(normalized, alias.alias, grouping.guards)) matches.add(alias.group);
  }
  return matches.size > 0 ? [...matches] : [value.trim()];
}

function containsUnguarded(normalized: string, term: string, guards: string[]) {
  let from = 0;
  while (from <= normalized.length - term.length) {
    const index = normalized.indexOf(term, from);
    if (index < 0) return false;
    const insideGuard = guards.some((guard) => spanInside(normalized, guard, index, term.length));
    if (!insideGuard) return true;
    from = index + 1;
  }
  return false;
}

function spanInside(normalized: string, guard: string, index: number, length: number) {
  if (guard.length <= length) return false;
  let from = 0;
  while (from <= normalized.length - guard.length) {
    const at = normalized.indexOf(guard, from);
    if (at < 0) return false;
    if (index >= at && index + length <= at + guard.length) return true;
    from = at + 1;
  }
  return false;
}

function sameGroup(group: string, selected: string) {
  return normalizeLabel(group) === normalizeLabel(selected);
}

function recordRefinement(
  aspects: Map<string, Map<string, number>>,
  seen: Set<string>,
  name: string,
  value: string,
) {
  const key = `${name}\0${value}`;
  if (seen.has(key)) return;
  seen.add(key);
  const counts = aspects.get(name) ?? new Map<string, number>();
  aspects.set(name, counts);
  counts.set(value, (counts.get(value) ?? 0) + 1);
}

export function aspectRefinements(offers: CatalogOffer[]): AspectRefinement[] {
  const aspects = new Map<string, Map<string, number>>();
  for (const offer of offers) {
    const seen = new Set<string>();
    for (const aspect of offer.aspects) {
      if (!filterAspectOrder.has(aspect.name)) continue;
      for (const value of groupedValues(aspect.name, aspect.value)) {
        recordRefinement(aspects, seen, aspect.name, value);
      }
    }
  }

  return [...aspects.entries()]
    .map(([name, values]) => ({
      name,
      values: [...values.entries()]
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value, "de")),
    }))
    .sort(
      (a, b) =>
        (filterAspectOrder.get(a.name) ?? FILTER_ASPECTS.length) -
        (filterAspectOrder.get(b.name) ?? FILTER_ASPECTS.length),
    );
}

export function matchesQuery(offer: CatalogOffer, query: string) {
  const tokens = query.trim().toLocaleLowerCase("de").split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;

  const haystack = [
    offer.title,
    offer.price,
    offer.condition,
    offer.categoryName,
    ...offer.aspects.flatMap((aspect) => [aspect.name, aspect.value]),
  ]
    .filter((part): part is string => Boolean(part))
    .join("\n")
    .toLocaleLowerCase("de");

  return tokens.every((token) => haystack.includes(token));
}

function aspectValueMatches(name: string, aspectValue: string, selected: string) {
  if (!normalizedAspectGroups.has(name)) return aspectValue === selected;
  return groupedValues(name, aspectValue).some((group) => sameGroup(group, selected));
}

export function offerMatches(offer: CatalogOffer, aspects: Record<string, string[]>) {
  return Object.entries(aspects).every(([name, values]) => {
    if (values.length === 0) return true;
    return values.some((value) =>
      offer.aspects.some(
        (aspect) => aspect.name === name && aspectValueMatches(name, aspect.value, value),
      ),
    );
  });
}

export function formatPrice(value: string, currency: string) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return `${value} ${currency}`;

  try {
    return new Intl.NumberFormat("de-DE", { style: "currency", currency }).format(amount);
  } catch {
    return `${value} ${currency}`;
  }
}

export function largeEbayImage(url: string) {
  return url.replace(/s-l\d+/g, "s-l1600");
}
