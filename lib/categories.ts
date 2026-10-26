import { normalizeOffer, slugify, type NormalizableOffer } from "@/lib/normalize";
import type { CatalogOffer } from "@/lib/shop";

export const MATERIAL_PAGE_MIN = 3;

export type CategoryPage = {
  path: string;
  slug: string;
  label: string;
  metaTitle: string;
  heading: string;
  description: string;
  offers: CatalogOffer[];
  crumbs: { name: string; path: string }[];
  related: { href: string; label: string }[];
};

function countLabel(count: number) {
  return count === 1 ? "1 Angebot" : `${count} Angebote`;
}

function topLine(offers: CatalogOffer[]) {
  const counts = new Map<string, number>();
  for (const offer of offers) {
    const product = normalizeOffer(offer);
    if (!product.line) continue;
    const name = [product.brand, product.line].filter(Boolean).join(" ");
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return (
    [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "de"))[0]?.[0] ??
    null
  );
}

function brandNames(offers: CatalogOffer[]) {
  const counts = new Map<string, number>();
  for (const offer of offers) {
    const brand = normalizeOffer(offer).brand;
    if (!brand) continue;
    counts.set(brand, (counts.get(brand) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "de"))
    .map(([name]) => name);
}

function joinList(items: string[]) {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} und ${items.at(-1)}`;
}

function sentence(text: string) {
  return `${text} Bestellung und Zahlung laufen über eBay.`;
}

export function woolOffers(offers: CatalogOffer[]) {
  return offers.filter((offer) => normalizeOffer(offer).yarn);
}

export function sockOffers(offers: CatalogOffer[]) {
  return offers.filter((offer) => normalizeOffer(offer).sockYarn);
}

export function woolPage(offers: CatalogOffer[]): CategoryPage | null {
  const yarn = woolOffers(offers);
  if (yarn.length === 0) return null;
  const brandList = joinList(brandNames(yarn).slice(0, 3));
  return {
    path: "/wolle",
    slug: "wolle",
    label: "Wolle",
    metaTitle: "Wolle",
    heading: "Wolle",
    description: sentence(
      `Aktuell ${countLabel(yarn.length)} an Wolle und Garn${brandList ? ` von ${brandList}` : ""}.`,
    ),
    offers: yarn,
    crumbs: [
      { name: "Startseite", path: "/" },
      { name: "Wolle", path: "/wolle" },
    ],
    related: [
      ...brandPages(offers).map((page) => ({ href: page.path, label: page.label })),
      ...materialPages(offers).map((page) => ({ href: page.path, label: page.label })),
      ...(sockOffers(offers).length > 0
        ? [{ href: "/garne/sockenwolle", label: "Sockenwolle" }]
        : []),
    ],
  };
}

function brandGroups(offers: CatalogOffer[]) {
  const groups = new Map<string, { label: string; offers: CatalogOffer[] }>();
  for (const offer of offers) {
    const product = normalizeOffer(offer);
    if (!product.brand || !product.brandSlug) continue;
    const group = groups.get(product.brandSlug) ?? { label: product.brand, offers: [] };
    group.offers.push(offer);
    groups.set(product.brandSlug, group);
  }
  return [...groups.entries()].sort((a, b) => a[1].label.localeCompare(b[1].label, "de"));
}

function materialGroups(offers: CatalogOffer[]) {
  const groups = new Map<string, CatalogOffer[]>();
  for (const offer of offers) {
    for (const material of normalizeOffer(offer).materials) {
      const list = groups.get(material) ?? [];
      list.push(offer);
      groups.set(material, list);
    }
  }
  return [...groups.entries()]
    .filter(([, list]) => list.length >= MATERIAL_PAGE_MIN)
    .sort((a, b) => a[0].localeCompare(b[0], "de"));
}

export function brandPages(offers: CatalogOffer[]): CategoryPage[] {
  const materials = materialGroups(offers).map(([label]) => ({
    href: `/material/${slugify(label)}`,
    label,
  }));
  const socks = sockOffers(offers).length > 0;

  return brandGroups(offers).map(([slug, group]) => {
    const line = topLine(group.offers);
    const relatedMaterials = materials.filter((page) =>
      group.offers.some((offer) => normalizeOffer(offer).materials.includes(page.label)),
    );
    return {
      path: `/marken/${slug}`,
      slug,
      label: group.label,
      metaTitle: group.label,
      heading: group.label,
      description: sentence(
        `Aktuell ${countLabel(group.offers.length)} von ${group.label}${line ? `, vor allem ${line}` : ""}.`,
      ),
      offers: group.offers,
      crumbs: [
        { name: "Startseite", path: "/" },
        { name: "Wolle", path: "/wolle" },
        { name: group.label, path: `/marken/${slug}` },
      ],
      related: [
        { href: "/wolle", label: "Wolle" },
        ...relatedMaterials,
        ...(socks && group.offers.some((offer) => normalizeOffer(offer).sockYarn)
          ? [{ href: "/garne/sockenwolle", label: "Sockenwolle" }]
          : []),
      ],
    };
  });
}

export function materialPages(offers: CatalogOffer[]): CategoryPage[] {
  const brands = brandGroups(offers).map(([slug, group]) => ({
    href: `/marken/${slug}`,
    label: group.label,
    slug,
  }));

  return materialGroups(offers).map(([label, list]) => {
    const slug = slugify(label);
    const names = brandNames(list).slice(0, 3);
    const brandText = names.length > 0 ? `, darunter ${joinList(names)}` : "";
    return {
      path: `/material/${slug}`,
      slug,
      label,
      metaTitle: label,
      heading: label,
      description: sentence(`Aktuell ${countLabel(list.length)} mit ${label}${brandText}.`),
      offers: list,
      crumbs: [
        { name: "Startseite", path: "/" },
        { name: "Wolle", path: "/wolle" },
        { name: label, path: `/material/${slug}` },
      ],
      related: [
        { href: "/wolle", label: "Wolle" },
        ...brands
          .filter((page) => list.some((offer) => normalizeOffer(offer).brandSlug === page.slug))
          .map((page) => ({ href: page.href, label: page.label })),
      ],
    };
  });
}

export function sockPage(offers: CatalogOffer[]): CategoryPage | null {
  const socks = sockOffers(offers);
  if (socks.length === 0) return null;
  const line = topLine(socks);
  return {
    path: "/garne/sockenwolle",
    slug: "sockenwolle",
    label: "Sockenwolle",
    metaTitle: "Sockenwolle",
    heading: "Sockenwolle",
    description: sentence(
      `Aktuell ${countLabel(socks.length)} an Sockenwolle${line ? `, vor allem ${line}` : ""}.`,
    ),
    offers: socks,
    crumbs: [
      { name: "Startseite", path: "/" },
      { name: "Wolle", path: "/wolle" },
      { name: "Sockenwolle", path: "/garne/sockenwolle" },
    ],
    related: [
      { href: "/wolle", label: "Wolle" },
      ...brandPages(offers)
        .filter((page) => socks.some((offer) => normalizeOffer(offer).brandSlug === page.slug))
        .map((page) => ({ href: page.path, label: page.label })),
    ],
  };
}

export function indexableCategories(offers: CatalogOffer[]) {
  return [
    woolPage(offers),
    sockPage(offers),
    ...brandPages(offers),
    ...materialPages(offers),
  ].filter((page): page is CategoryPage => Boolean(page));
}

export function categoryByPath(offers: CatalogOffer[], path: string) {
  return indexableCategories(offers).find((page) => page.path === path) ?? null;
}

export function featuredOffers(offers: CatalogOffer[], limit = 3) {
  const picked: CatalogOffer[] = [];
  const seen = new Set<string>();
  for (const offer of offers) {
    const brand = normalizeOffer(offer).brand;
    if (!brand || seen.has(brand)) continue;
    seen.add(brand);
    picked.push(offer);
  }
  for (const offer of offers) {
    if (picked.length >= limit) break;
    if (picked.some((item) => item.id === offer.id)) continue;
    picked.push(offer);
  }
  return picked.slice(0, limit);
}

export function relatedVariants(offer: CatalogOffer, offers: CatalogOffer[]) {
  const group = offer.id.split("-")[0];
  return offers
    .filter((item) => item.id !== offer.id && item.id.split("-")[0] === group)
    .sort((left, right) => {
      const a = normalizeOffer(left);
      const b = normalizeOffer(right);
      const aNumber = a.colorNumber ? Number(a.colorNumber) : Number.POSITIVE_INFINITY;
      const bNumber = b.colorNumber ? Number(b.colorNumber) : Number.POSITIVE_INFINITY;
      return (
        aNumber - bNumber ||
        (a.colorDescription ?? "").localeCompare(b.colorDescription ?? "", "de")
      );
    });
}

export function moreFromBrand(offer: CatalogOffer, offers: CatalogOffer[], limit = 4) {
  const product = normalizeOffer(offer);
  const variantIds = new Set(relatedVariants(offer, offers).map((item) => item.id));
  if (!product.brand) return [];
  return offers
    .filter((item) => {
      if (item.id === offer.id || variantIds.has(item.id)) return false;
      return normalizeOffer(item).brand === product.brand;
    })
    .slice(0, limit);
}

export function productLinks(offer: NormalizableOffer & CatalogOffer, offers: CatalogOffer[]) {
  const product = normalizeOffer(offer);
  const links: { href: string; label: string }[] = [];
  if (product.yarn) links.push({ href: "/wolle", label: "Wolle" });
  if (product.brand && product.brandSlug) {
    links.push({ href: `/marken/${product.brandSlug}`, label: product.brand });
  }
  const materials = new Set(materialPages(offers).map((page) => page.label));
  for (const material of product.materials) {
    if (!materials.has(material)) continue;
    links.push({ href: `/material/${slugify(material)}`, label: material });
  }
  if (product.sockYarn && sockOffers(offers).length > 0) {
    links.push({ href: "/garne/sockenwolle", label: "Sockenwolle" });
  }
  return links;
}
