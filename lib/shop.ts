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

export type CategoryRefinement = {
  id: string;
  name: string;
  count: number;
};

export type ShopListing = {
  offers: OfferTeaser[];
  refinements: {
    categories: CategoryRefinement[];
    aspects: AspectRefinement[];
    categoryId: string | null;
  };
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

export function categoryRefinements(offers: CatalogOffer[]): CategoryRefinement[] {
  const categories = new Map<string, CategoryRefinement>();
  for (const offer of offers) {
    if (!offer.categoryId || !offer.categoryName) continue;
    const current = categories.get(offer.categoryId);
    if (current) current.count += 1;
    else
      categories.set(offer.categoryId, {
        id: offer.categoryId,
        name: offer.categoryName,
        count: 1,
      });
  }
  return [...categories.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name, "de"),
  );
}

const FILTER_ASPECTS = ["Material", "Farbe", "Marke", "Produktart", "Lauflänge", "Stil", "Form"];

const filterAspectOrder = new Map(FILTER_ASPECTS.map((name, index) => [name, index]));

export function aspectRefinements(offers: CatalogOffer[]): AspectRefinement[] {
  const aspects = new Map<string, Map<string, number>>();
  for (const offer of offers) {
    const seen = new Set<string>();
    for (const aspect of offer.aspects) {
      if (!filterAspectOrder.has(aspect.name)) continue;
      const key = `${aspect.name}\0${aspect.value}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const values = aspects.get(aspect.name) ?? new Map<string, number>();
      aspects.set(aspect.name, values);
      values.set(aspect.value, (values.get(aspect.value) ?? 0) + 1);
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

export function offerMatches(
  offer: CatalogOffer,
  categoryId: string,
  aspects: Record<string, string[]>,
) {
  if (categoryId && offer.categoryId !== categoryId) return false;
  return Object.entries(aspects).every(([name, values]) => {
    if (values.length === 0) return true;
    return values.some((value) =>
      offer.aspects.some((aspect) => aspect.name === name && aspect.value === value),
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
