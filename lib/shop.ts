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

export type AspectValue = {
  value: string;
  count: number;
  label?: string;
  children?: AspectValue[];
};

export type AspectRefinement = {
  name: string;
  label?: string;
  values: AspectValue[];
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

const REQUIRED_ASPECTS = ["Farbe", "Material", "Marke", "Produktart", "Lauflänge", "Form"];

function filled(value: string | null | undefined) {
  return Boolean(value?.trim());
}

function descriptionText(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function missingOfferFields(offer: OfferDetail) {
  const missing: string[] = [];
  if (!filled(offer.title)) missing.push("Title");
  if (!filled(offer.price)) missing.push("Price");
  if (!offer.images.some((image) => image.trim())) missing.push("Image");
  if (!filled(offer.condition)) missing.push("Condition");
  if (!descriptionText(offer.descriptionHtml)) missing.push("Description");
  if (!filled(offer.itemWebUrl)) missing.push("eBay link");

  for (const name of REQUIRED_ASPECTS) {
    const present = offer.aspects.some(
      (aspect) =>
        aspect.name.localeCompare(name, "de", { sensitivity: "base" }) === 0 &&
        filled(aspect.value),
    );
    if (!present) missing.push(name);
  }

  return missing;
}

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

type ShopFilterParams = {
  get(name: string): string | null;
  getAll(name: string): string[];
};

export function shopFilterQuery(params: ShopFilterParams) {
  const next = new URLSearchParams();
  const query = params.get("q");
  if (query) next.set("q", query);
  for (const value of params.getAll("aspect")) next.append("aspect", value);
  return next.toString();
}

export function withFilterQuery(path: string, query: string) {
  return query ? `${path}?${query}` : path;
}

export function withoutAspects(params: URLSearchParams) {
  const next = new URLSearchParams(params);
  next.delete("aspect");
  return next;
}

function writeAspects(params: URLSearchParams, selected: Record<string, string[]>) {
  const next = new URLSearchParams(params);
  next.delete("aspect");

  for (const [aspectName, aspectValues] of Object.entries(selected)) {
    for (const aspectValue of aspectValues) {
      if (!aspectValue) continue;
      next.append("aspect", `${aspectName}:${aspectValue}`);
    }
  }

  return next;
}

export function withToggledAspect(params: URLSearchParams, name: string, value: string) {
  const current = parseAspectParams(params);
  const values = current[name] ?? [];
  const nextValues = values.includes(value)
    ? values.filter((entry) => entry !== value)
    : [...values, value];
  return writeAspects(params, { ...current, [name]: nextValues });
}

export const COLORWAY_ASPECT = "Farbverlaufs-Nummer";

export function withColorway(params: URLSearchParams, value: string) {
  const digits = value.replace(/\D/g, "");
  const current = parseAspectParams(params);
  return writeAspects(params, {
    ...current,
    [COLORWAY_ASPECT]: digits ? [digits] : [],
  });
}

const FILTER_ASPECTS = [
  "Material",
  "Farbe",
  "Marke",
  "Produktart",
  "Lauflänge",
  /* "Stil", */ "Form",
];

const filterAspectOrder = new Map(FILTER_ASPECTS.map((name, index) => [name, index]));

// A value belongs to every group whose name it contains: Silbergrau → Grau, Seide mit Baumwolle → Seide and Baumwolle.
// Shade names from yarn color cards join that group even when the group name is absent: Marine → Blau, Ocker → Gelb, Rose → Rosa.
// Guards are longer color words that only contain a shorter shade by accident: Frost is not Rost, Primrose is not Rose.
// A bare number is a gradient colorway code, not its own color: 580 joins Farbverlauf, and also every color named in the title segment before that code.
// A Produktart of Verlaufswolle or Verlaufsgarn joins Farbverlauf as well. The colorway number stays its own filter.
// Produktart Farbverlaufswolle joins the Farbverlaufsgarn filter.
export const FARBVERLAUF = "Farbverlauf";
const GRADIENT_PRODUCT_TYPES = ["verlaufswolle", "verlaufsgarn"];
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
  Produktart: ["Farbverlaufsgarn"],
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
  Produktart: {
    Farbverlaufswolle: "Farbverlaufsgarn",
  },
};

function normalizeLabel(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("de")
    .replaceAll("ß", "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

type AspectGrouping = {
  groups: { name: string; normalized: string }[];
  aliases: { alias: string; group: string }[];
  guards: string[];
};

const normalizedAspectGroups = new Map<string, AspectGrouping>(
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

function isColorwayCode(value: string) {
  return /^\d+$/.test(value.trim());
}

function isGradientProductType(value: string) {
  const normalized = normalizeLabel(value);
  return GRADIENT_PRODUCT_TYPES.some((type) => normalized.includes(type));
}

function hasGradientProductType(offer: CatalogOffer) {
  return offer.aspects.some(
    (aspect) => aspect.name === "Produktart" && isGradientProductType(aspect.value),
  );
}

function colorPhrase(title: string, code: string) {
  const trimmed = title.trim();
  const suffix = `, ${code.trim()}`;
  if (!trimmed.endsWith(suffix)) return "";
  const head = trimmed.slice(0, -suffix.length);
  const comma = head.lastIndexOf(",");
  return (comma >= 0 ? head.slice(comma + 1) : head).trim();
}

function matchingGroups(grouping: AspectGrouping, value: string) {
  const normalized = normalizeLabel(value);
  const matches = new Set(
    grouping.groups
      .filter((group) => containsUnguarded(normalized, group.normalized, grouping.guards))
      .map((group) => group.name),
  );
  for (const alias of grouping.aliases) {
    if (containsUnguarded(normalized, alias.alias, grouping.guards)) matches.add(alias.group);
  }
  return [...matches];
}

function groupedValues(aspectName: string, value: string, title = "") {
  const grouping = normalizedAspectGroups.get(aspectName);
  if (!grouping) return [value];

  if (aspectName === "Farbe" && isColorwayCode(value)) {
    const phrase = colorPhrase(title, value);
    const named = phrase ? matchingGroups(grouping, phrase) : [];
    return [...new Set([...named, FARBVERLAUF])];
  }

  const matches = matchingGroups(grouping, value);
  return matches.length > 0 ? matches : [value.trim()];
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

const WEIGHT_PATTERN = /(\d+)\s*g\b/i;
const LENGTH_PATTERN = /(\d+)\s*m\b/i;

function laufParts(value: string) {
  const weight = value.match(WEIGHT_PATTERN);
  if (!weight) return null;
  const length = value.match(LENGTH_PATTERN);
  return {
    weight: Number(weight[1]),
    length: length ? Number(length[1]) : null,
  };
}

function selectedLauf(value: string) {
  const match = value.match(/^(\d+) g(?::(\d+) m)?$/);
  if (!match) return null;
  return {
    weight: Number(match[1]),
    length: match[2] ? Number(match[2]) : null,
  };
}

function laufRefinement(offers: CatalogOffer[]): AspectRefinement | null {
  const weights = new Map<number, { count: number; lengths: Map<number, number> }>();

  for (const offer of offers) {
    const seenWeights = new Set<number>();
    const seenLengths = new Set<string>();
    for (const aspect of offer.aspects) {
      if (aspect.name !== "Lauflänge") continue;
      const parts = laufParts(aspect.value);
      if (!parts || seenWeights.has(parts.weight)) continue;
      seenWeights.add(parts.weight);
      const group = weights.get(parts.weight) ?? { count: 0, lengths: new Map<number, number>() };
      group.count += 1;
      weights.set(parts.weight, group);
      if (parts.length == null) continue;
      const key = `${parts.weight}:${parts.length}`;
      if (seenLengths.has(key)) continue;
      seenLengths.add(key);
      group.lengths.set(parts.length, (group.lengths.get(parts.length) ?? 0) + 1);
    }
  }

  if (weights.size === 0) return null;

  return {
    name: "Lauflänge",
    label: "Gewicht",
    values: [...weights.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([weight, group]) => ({
        value: `${weight} g`,
        count: group.count,
        children: [...group.lengths.entries()]
          .sort((a, b) => a[0] - b[0])
          .map(([length, count]) => ({
            value: `${weight} g:${length} m`,
            label: `${length} m`,
            count,
          })),
      })),
  };
}

function laufValueMatches(aspectValue: string, selected: string) {
  const want = selectedLauf(selected);
  if (!want) return aspectValue === selected;
  const offer = laufParts(aspectValue);
  if (!offer || offer.weight !== want.weight) return false;
  if (want.length == null) return true;
  return offer.length === want.length;
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
      if (!filterAspectOrder.has(aspect.name) || aspect.name === "Lauflänge") continue;
      for (const value of groupedValues(aspect.name, aspect.value, offer.title)) {
        recordRefinement(aspects, seen, aspect.name, value);
      }
    }
    if (hasGradientProductType(offer)) {
      recordRefinement(aspects, seen, "Farbe", FARBVERLAUF);
    }
  }

  const lauf = laufRefinement(offers);

  return [...aspects.entries()]
    .map(([name, values]) => ({
      name,
      values: [...values.entries()]
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value, "de")),
    }))
    .concat(lauf ? [lauf] : [])
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

function aspectValueMatches(name: string, aspectValue: string, selected: string, title: string) {
  if (name === "Lauflänge") return laufValueMatches(aspectValue, selected);
  if (!normalizedAspectGroups.has(name)) return aspectValue === selected;
  return groupedValues(name, aspectValue, title).some((group) => sameGroup(group, selected));
}

function colorwayMatches(offer: CatalogOffer, selected: string) {
  const code = selected.trim();
  if (!isColorwayCode(code)) return false;
  return offer.aspects.some(
    (aspect) =>
      aspect.name === "Farbe" && isColorwayCode(aspect.value) && aspect.value.trim() === code,
  );
}

export function offerMatches(offer: CatalogOffer, aspects: Record<string, string[]>) {
  return Object.entries(aspects).every(([name, values]) => {
    if (values.length === 0) return true;
    if (name === COLORWAY_ASPECT) return values.some((value) => colorwayMatches(offer, value));
    return values.some((value) => {
      if (name === "Farbe" && sameGroup(value, FARBVERLAUF) && hasGradientProductType(offer)) {
        return true;
      }
      return offer.aspects.some(
        (aspect) =>
          aspect.name === name && aspectValueMatches(name, aspect.value, value, offer.title),
      );
    });
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
