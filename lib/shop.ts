import {
  FARBVERLAUF,
  foldSearch,
  matchesBrand,
  matchesColor,
  matchesColorNumber,
  matchesForm,
  matchesMaterial,
  normalizeOffer,
} from "@/lib/normalize";
import { listedBrand, OTHER_BRAND, producerLogo } from "@/services/producers";

export { FARBVERLAUF };

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

function produktartValue(value: string) {
  return value === "Farbverlaufswolle" ? "Farbverlaufsgarn" : value;
}

export function aspectRefinements(offers: CatalogOffer[]): AspectRefinement[] {
  const aspects = new Map<string, Map<string, number>>();
  for (const offer of offers) {
    const product = normalizeOffer(offer);
    const seen = new Set<string>();
    if (product.brand) recordRefinement(aspects, seen, "Marke", listedBrand(product.brand));
    for (const material of product.materials) {
      recordRefinement(aspects, seen, "Material", material);
    }
    for (const color of product.colorGroups) recordRefinement(aspects, seen, "Farbe", color);
    if (product.gradient) recordRefinement(aspects, seen, "Farbe", FARBVERLAUF);
    if (product.form) recordRefinement(aspects, seen, "Form", product.form);
    if (product.productType) {
      recordRefinement(aspects, seen, "Produktart", produktartValue(product.productType));
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
  const tokens = foldSearch(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;

  const product = normalizeOffer(offer);
  const haystack = foldSearch(
    [
      offer.title,
      offer.price,
      offer.condition,
      offer.categoryName,
      product.brand,
      product.line,
      product.colorNumber,
      product.colorDescription,
      product.titleColor,
      product.aspectColor,
      product.colorGroups.join(" "),
      product.materialPhrase,
      product.materials.join(" "),
      product.form,
      product.productType,
      ...offer.aspects.flatMap((aspect) => [aspect.name, aspect.value]),
    ]
      .filter((part): part is string => Boolean(part))
      .join("\n"),
  );

  return tokens.every((token) => haystack.includes(token));
}

function produktartMatches(offer: CatalogOffer, selected: string) {
  return offer.aspects.some(
    (aspect) =>
      aspect.name === "Produktart" &&
      foldSearch(produktartValue(aspect.value)) === foldSearch(selected),
  );
}

export function offerMatches(offer: CatalogOffer, aspects: Record<string, string[]>) {
  const product = normalizeOffer(offer);
  return Object.entries(aspects).every(([name, values]) => {
    if (values.length === 0) return true;
    if (name === COLORWAY_ASPECT) return values.some((value) => matchesColorNumber(product, value));
    return values.some((value) => {
      if (name === "Farbe") return matchesColor(product, value);
      if (name === "Material") return matchesMaterial(product, value);
      if (name === "Marke") {
        if (value === OTHER_BRAND)
          return Boolean(product.brand) && product.brand && !producerLogo(product.brand);
        return matchesBrand(product, value);
      }
      if (name === "Form") return matchesForm(product, value);
      if (name === "Produktart") return produktartMatches(offer, value);
      if (name === "Lauflänge") {
        return offer.aspects.some(
          (aspect) => aspect.name === "Lauflänge" && laufValueMatches(aspect.value, value),
        );
      }
      return offer.aspects.some((aspect) => aspect.name === name && aspect.value === value);
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
