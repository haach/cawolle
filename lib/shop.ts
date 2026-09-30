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
// Aliases join that group even when the group name is not part of the value.
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
  Farbe: [
    "Apricot",
    "Beige",
    "Blau",
    "Bordeaux",
    "Braun",
    "Cotto",
    "Creme",
    "Flieder",
    "Gelb",
    "Gold",
    "Grau",
    "Grün",
    "Lila",
    "Mint",
    "Natur",
    "Oliv",
    "Orange",
    "Petrol",
    "Pink",
    "Rosa",
    "Rot",
    "Schwarz",
    "Türkis",
    "Violett",
    "Weiß",
  ],
};

const ASPECT_ALIASES: Record<string, Record<string, string>> = {
  Material: {
    Acryl: "Polyacryl",
    Alpaka: "Alpaca",
    Kaschmir: "Cashmere",
    Sockengarn: "Sockengarne",
  },
  Farbe: {
    Schlamm: "Braun",
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

const normalizedAspectGroups = new Map(
  Object.entries(ASPECT_GROUPS).map(([aspect, groups]) => [
    aspect,
    {
      groups: groups.map((name) => ({ name, normalized: normalizeLabel(name) })),
      aliases: Object.entries(ASPECT_ALIASES[aspect] ?? {}).map(([alias, group]) => ({
        alias: normalizeLabel(alias),
        group,
      })),
    },
  ]),
);

function groupedValues(aspectName: string, value: string) {
  const grouping = normalizedAspectGroups.get(aspectName);
  if (!grouping) return [value];

  const normalized = normalizeLabel(value);
  const matches = new Set(
    grouping.groups
      .filter((group) => normalized.includes(group.normalized))
      .map((group) => group.name),
  );
  for (const alias of grouping.aliases) {
    if (normalized.includes(alias.alias)) matches.add(alias.group);
  }
  return matches.size > 0 ? [...matches] : [value.trim()];
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
