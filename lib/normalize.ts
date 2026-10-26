export const FARBVERLAUF = "Farbverlauf";

export type OfferAspect = { name: string; value: string };

export type NormalizableOffer = {
  id: string;
  title: string;
  aspects: OfferAspect[];
  categoryName?: string | null;
  descriptionHtml?: string;
};

export type NormalizedOffer = {
  id: string;
  rawTitle: string;
  brand: string | null;
  brandSlug: string | null;
  line: string | null;
  colorNumber: string | null;
  colorDescription: string | null;
  titleColor: string | null;
  aspectColor: string | null;
  colorGroups: string[];
  colorConflict: boolean;
  gradient: boolean;
  materialPhrase: string | null;
  materials: string[];
  formRaw: string | null;
  form: string | null;
  weightGrams: number | null;
  lengthMeters: number | null;
  lengthRaw: string | null;
  needle: string | null;
  productType: string | null;
  sockYarn: boolean;
  yarn: boolean;
  categoryName: string | null;
};

export type QualityIssue = {
  id: string;
  field: string;
  reason: string;
};

const BRAND_ALIASES: Record<string, string> = {
  zitron: "Zitron",
  zitronn: "Zitron",
  "atelier zitron": "Zitron",
  katia: "Katia",
  "lang yarns": "Lang Yarns",
  lang: "Lang Yarns",
  ggh: "ggh",
};

const MATERIAL_ALIASES: Record<string, string> = {
  alpaka: "Alpaka",
  alpaca: "Alpaka",
  acryl: "Polyacryl",
  polyacyl: "Polyacryl",
  polyacryl: "Polyacryl",
  kaschmir: "Kaschmir",
  cashmere: "Kaschmir",
  baumwolle: "Baumwolle",
  baumwoll: "Baumwolle",
  merino: "Merino",
  seide: "Seide",
  mohair: "Mohair",
  leinen: "Leinen",
  linen: "Leinen",
  schurwolle: "Schurwolle",
  wolle: "Wolle",
  polyamid: "Polyamid",
  viskose: "Viskose",
  bambus: "Bambus",
};

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

const FARBE_ALIASES: Record<string, string> = Object.fromEntries(
  Object.entries(FARBE_MEMBERS).flatMap(([group, members]) =>
    members.map((member) => [member, group]),
  ),
);

const GUARDS = FARBE_GUARDS.map((guard) => foldSearch(guard));

export function foldSearch(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("de")
    .replaceAll("ß", "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function slugify(value: string) {
  return foldSearch(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function aspectValue(aspects: OfferAspect[], name: string) {
  const value = aspects.find(
    (aspect) => aspect.name.localeCompare(name, "de", { sensitivity: "base" }) === 0,
  )?.value;
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function canonicalBrand(value: string) {
  const folded = foldSearch(value);
  return BRAND_ALIASES[folded] ?? value.trim();
}

function brandFromAspect(value: string | null) {
  if (!value) return null;
  return canonicalBrand(value);
}

export function canonicalMaterialToken(value: string) {
  const folded = foldSearch(value).replace(/anteil$/i, "");
  const aliases = Object.entries(MATERIAL_ALIASES).sort((a, b) => b[0].length - a[0].length);
  for (const [alias, canonical] of aliases) {
    if (folded === alias) return canonical;
  }
  for (const [alias, canonical] of aliases) {
    if (folded.includes(alias)) return canonical;
  }
  return null;
}

function materialTokens(phrase: string) {
  const found: string[] = [];
  for (const part of phrase.split(/\s+(?:mit|und)\s+/i)) {
    let remaining = foldSearch(part);
    const aliases = Object.entries(MATERIAL_ALIASES).sort((a, b) => b[0].length - a[0].length);
    for (const [alias, canonical] of aliases) {
      if (!remaining.includes(alias)) continue;
      if (!found.includes(canonical)) found.push(canonical);
      remaining = remaining.replaceAll(alias, " ");
    }
  }
  return found;
}

function containsUnguarded(normalized: string, term: string) {
  let from = 0;
  while (from <= normalized.length - term.length) {
    const index = normalized.indexOf(term, from);
    if (index < 0) return false;
    const insideGuard = GUARDS.some((guard) => spanInside(normalized, guard, index, term.length));
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

function matchingGroups(value: string) {
  const normalized = foldSearch(value);
  const matches = new Set<string>();
  for (const group of Object.keys(FARBE_MEMBERS)) {
    if (containsUnguarded(normalized, foldSearch(group))) matches.add(group);
  }
  for (const [alias, group] of Object.entries(FARBE_ALIASES)) {
    if (containsUnguarded(normalized, foldSearch(alias))) matches.add(group);
  }
  return [...matches];
}

function groupTerms(group: string) {
  const terms = [foldSearch(group)];
  for (const [alias, target] of Object.entries(FARBE_ALIASES)) {
    if (target === group) terms.push(foldSearch(alias));
  }
  return terms;
}

function earliest(folded: string, group: string) {
  let best = Number.POSITIVE_INFINITY;
  for (const term of groupTerms(group)) {
    const index = folded.indexOf(term);
    if (index >= 0 && index < best) best = index;
  }
  return best;
}

export function colorGroupsFrom(value: string) {
  const trimmed = value.trim();
  if (!trimmed || /^\d+$/.test(trimmed)) return [];
  const folded = foldSearch(trimmed);
  return matchingGroups(trimmed).sort(
    (a, b) => earliest(folded, a) - earliest(folded, b) || a.localeCompare(b, "de"),
  );
}

function titleColor(title: string) {
  const labeled = title.match(/Farbe\s+(\d+)(?:\s+([^,]+))?/i);
  if (labeled) {
    return { number: labeled[1], phrase: labeled[2]?.trim() || null };
  }
  const trailing = title.match(/,\s*(\d+)\s*$/);
  if (!trailing || trailing.index == null) return { number: null, phrase: null };
  const without = title.slice(0, trailing.index).trim();
  const comma = without.lastIndexOf(",");
  const phrase = (comma >= 0 ? without.slice(comma + 1) : without).trim();
  return { number: trailing[1], phrase: phrase || null };
}

function isPalettePhrase(phrase: string) {
  return /farbgruppe|kombination|farbkombi|\bkombis\b|\bbunte?\b|verschieden/i.test(phrase);
}

function usableDescription(phrase: string | null) {
  if (!phrase) return null;
  const cleaned = phrase.replace(/^farbgruppen\s+/i, "").trim();
  if (!cleaned || /^\d+$/.test(cleaned) || isPalettePhrase(phrase)) return null;
  return cleaned;
}

function sameGroups(left: string[], right: string[]) {
  if (left.length !== right.length) return false;
  const other = new Set(right);
  return left.every((group) => other.has(group));
}

function preferDescription(left: string | null, right: string | null) {
  if (left && right) {
    const foldedLeft = foldSearch(left);
    const foldedRight = foldSearch(right);
    if (foldedLeft.includes(foldedRight) || foldedRight.includes(foldedLeft)) {
      return foldedLeft.length >= foldedRight.length ? left : right;
    }
    return left.length >= right.length ? left : right;
  }
  return left ?? right;
}

function unionGroups(first: string[], second: string[]) {
  const seen = new Set<string>();
  const groups: string[] = [];
  for (const group of [...first, ...second]) {
    if (seen.has(group)) continue;
    seen.add(group);
    groups.push(group);
  }
  return groups;
}

function lineFromTitle(title: string, brand: string | null) {
  const head = title.split(",")[0]?.trim() ?? "";
  if (!head) return null;
  const prefixes = [
    brand,
    brand === "Zitron" ? "Zitronn" : null,
    brand === "Lang Yarns" ? "Lang Yarns" : null,
    brand === "Lang Yarns" ? "Lang" : null,
  ].filter((prefix): prefix is string => Boolean(prefix));
  prefixes.sort((a, b) => b.length - a.length);
  let rest = head;
  for (const prefix of prefixes) {
    if (!foldSearch(rest).startsWith(foldSearch(prefix))) continue;
    rest = rest.slice(prefix.length).trim();
    break;
  }
  const line = rest.replace(/\bxxl\b/gi, "XXL").trim();
  if (!line || foldSearch(line) === foldSearch(head)) return null;
  return line;
}

export function normalizeForm(value: string | null) {
  if (!value) return null;
  const folded = foldSearch(value);
  if (folded === "knaul" || folded === "knaeuel" || folded === "ball") return "Knäuel";
  if (folded === "bobbel") return "Bobbel";
  if (folded === "strang") return "Strang";
  return value.trim();
}

function plainText(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function needleFrom(text: string) {
  const match = text.match(
    /Nadelstärke\s*:?\s*(\d+(?:[.,]\d+)?(?:\s*[–—-]\s*\d+(?:[.,]\d+)?)?(?:\s*mm)?)/i,
  );
  return match?.[1]?.trim() ?? null;
}

function parseLength(value: string | null) {
  if (!value) return { weightGrams: null, lengthMeters: null };
  const weight = value.match(/(\d+)\s*g\b/i);
  const length = value.match(/(\d+)\s*m\b/i);
  return {
    weightGrams: weight ? Number(weight[1]) : null,
    lengthMeters: length ? Number(length[1]) : null,
  };
}

export function normalizeOffer(offer: NormalizableOffer): NormalizedOffer {
  const brand = brandFromAspect(aspectValue(offer.aspects, "Marke"));
  const line = lineFromTitle(offer.title, brand);
  const aspectFarbe = aspectValue(offer.aspects, "Farbe");
  const fromTitle = titleColor(offer.title);
  const aspectIsNumber = Boolean(aspectFarbe && /^\d+$/.test(aspectFarbe));
  const colorNumber = (aspectIsNumber ? aspectFarbe : null) ?? fromTitle.number;
  const aspectText = aspectFarbe && !aspectIsNumber ? aspectFarbe : null;
  const titlePhrase = fromTitle.phrase;
  const aspectGroups = aspectText ? colorGroupsFrom(aspectText) : [];
  const titleGroups = titlePhrase ? colorGroupsFrom(titlePhrase) : [];
  const colorConflict = Boolean(
    aspectText && titlePhrase && !sameGroups(aspectGroups, titleGroups),
  );
  const materialPhrase = aspectValue(offer.aspects, "Material");
  const productType = aspectValue(offer.aspects, "Produktart");
  const style = aspectValue(offer.aspects, "Stil");
  const formRaw = aspectValue(offer.aspects, "Form");
  const lengthRaw = aspectValue(offer.aspects, "Lauflänge");
  const length = parseLength(lengthRaw);
  const description = offer.descriptionHtml ? plainText(offer.descriptionHtml) : "";
  const categoryName = offer.categoryName ?? null;
  const gradient = /farbverlauf|degrade/.test(
    foldSearch(`${productType ?? ""} ${style ?? ""} ${offer.title}`),
  );
  const sockYarn = /sockengarn|sockenwolle/.test(
    foldSearch(`${offer.title} ${line ?? ""} ${productType ?? ""} ${style ?? ""}`),
  );
  const yarn = /garn|wolle/.test(
    foldSearch(`${categoryName ?? ""} ${productType ?? ""} ${offer.title}`),
  );

  return {
    id: offer.id,
    rawTitle: offer.title,
    brand,
    brandSlug: brand ? slugify(brand) : null,
    line,
    colorNumber,
    colorDescription: colorConflict
      ? null
      : preferDescription(usableDescription(titlePhrase), usableDescription(aspectText)),
    titleColor: colorConflict ? titlePhrase : null,
    aspectColor: colorConflict ? aspectText : null,
    colorGroups: unionGroups(titleGroups, aspectGroups),
    colorConflict,
    gradient,
    materialPhrase,
    materials: materialPhrase ? materialTokens(materialPhrase) : [],
    formRaw,
    form: normalizeForm(formRaw),
    weightGrams: length.weightGrams,
    lengthMeters: length.lengthMeters,
    lengthRaw,
    needle: description ? needleFrom(description) : null,
    productType,
    sockYarn,
    yarn,
    categoryName,
  };
}

export function displayHeading(product: NormalizedOffer) {
  const parts = [product.brand, product.line].filter((part): part is string => Boolean(part));
  return parts.length > 0 ? parts.join(" ") : product.rawTitle;
}

export function variantLabel(product: NormalizedOffer) {
  if (product.colorConflict) {
    return [product.titleColor, product.aspectColor].filter(Boolean).join(" / ");
  }
  if (product.colorNumber && product.colorDescription) {
    return `Farbe ${product.colorNumber}, ${product.colorDescription}`;
  }
  if (product.colorNumber && product.colorGroups.length > 1) {
    return `Farbe ${product.colorNumber}, ${product.colorGroups.join(" / ")}`;
  }
  if (product.colorNumber && product.colorGroups.length === 1) {
    return `Farbe ${product.colorNumber}, ${product.colorGroups[0]}`;
  }
  if (product.colorNumber) return `Farbe ${product.colorNumber}`;
  if (product.colorDescription) return product.colorDescription;
  if (product.colorGroups.length > 0) return product.colorGroups.join(" / ");
  return displayHeading(product);
}

export function pageTitle(product: NormalizedOffer) {
  const heading = displayHeading(product);
  const color = variantLabel(product);
  if (!color || color === heading) return heading;
  return `${heading}, ${color}`;
}

export function summaryLines(product: NormalizedOffer) {
  const lines: string[] = [];
  if (product.colorNumber) lines.push(`Farbe: ${product.colorNumber}`);
  if (product.colorConflict) {
    if (product.titleColor) lines.push(product.titleColor);
    if (product.aspectColor && product.aspectColor !== product.titleColor) {
      lines.push(product.aspectColor);
    }
  } else if (product.colorDescription) {
    lines.push(product.colorDescription);
  } else if (product.colorGroups.length > 0) {
    lines.push(product.colorGroups.join(" / "));
  }
  if (product.gradient) lines.push(FARBVERLAUF);
  return lines;
}

export function factRows(product: NormalizedOffer) {
  const rows: { label: string; value: string }[] = [];
  if (product.colorNumber) rows.push({ label: "Farbe", value: product.colorNumber });
  if (product.colorConflict) {
    if (product.titleColor) rows.push({ label: "Farbe im Titel", value: product.titleColor });
    if (product.aspectColor) rows.push({ label: "Farbe bei eBay", value: product.aspectColor });
  } else if (product.colorDescription) {
    rows.push({ label: "Farbton", value: product.colorDescription });
  } else if (product.colorGroups.length > 0) {
    rows.push({ label: "Farbton", value: product.colorGroups.join(" / ") });
  }
  if (product.gradient) rows.push({ label: "Ausführung", value: FARBVERLAUF });
  if (product.materialPhrase) rows.push({ label: "Material", value: product.materialPhrase });
  if (product.weightGrams != null)
    rows.push({ label: "Gewicht", value: `${product.weightGrams} g` });
  if (product.lengthMeters != null)
    rows.push({ label: "Lauflänge", value: `${product.lengthMeters} m` });
  if (product.needle) rows.push({ label: "Nadelstärke", value: product.needle });
  if (product.form) rows.push({ label: "Form", value: product.form });
  return rows;
}

export function matchesMaterial(product: NormalizedOffer, selected: string) {
  const token = canonicalMaterialToken(selected);
  if (token && product.materials.includes(token)) return true;
  if (product.materialPhrase && foldSearch(product.materialPhrase) === foldSearch(selected))
    return true;
  return product.materials.some((material) => foldSearch(material) === foldSearch(selected));
}

export function matchesForm(product: NormalizedOffer, selected: string) {
  return product.form === normalizeForm(selected) || product.formRaw === selected;
}

export function matchesBrand(product: NormalizedOffer, selected: string) {
  if (!product.brand) return false;
  return foldSearch(product.brand) === foldSearch(canonicalBrand(selected));
}

export function matchesColor(product: NormalizedOffer, selected: string) {
  if (foldSearch(selected) === foldSearch(FARBVERLAUF)) return product.gradient;
  return product.colorGroups.some((group) => foldSearch(group) === foldSearch(selected));
}

export function matchesColorNumber(product: NormalizedOffer, selected: string) {
  const digits = selected.replace(/\D/g, "");
  return Boolean(digits && product.colorNumber === digits);
}

export function qualityIssues(offer: NormalizableOffer): QualityIssue[] {
  const product = normalizeOffer(offer);
  const issues: QualityIssue[] = [];
  const push = (field: string, reason: string) => issues.push({ id: offer.id, field, reason });

  if (
    !product.colorNumber &&
    !product.colorDescription &&
    product.colorGroups.length === 0 &&
    !product.colorConflict
  ) {
    push("Farbe", "Keine Farbnummer und keine Farbbeschreibung.");
  }
  if (!product.materialPhrase) push("Material", "Material fehlt.");
  if (product.colorConflict) {
    push(
      "Farbe",
      `Titel „${product.titleColor ?? ""}“ und eBay-Angabe „${product.aspectColor ?? ""}“ widersprechen sich.`,
    );
  }
  const aspectFarbe = aspectValue(offer.aspects, "Farbe");
  const fromTitle = titleColor(offer.title);
  if (
    aspectFarbe &&
    /^\d+$/.test(aspectFarbe) &&
    fromTitle.number &&
    aspectFarbe !== fromTitle.number
  ) {
    push(
      "Farbe",
      `Farbnummer ${aspectFarbe} und Titelnummer ${fromTitle.number} unterscheiden sich.`,
    );
  }
  if (product.lengthRaw && product.weightGrams == null) {
    push("Lauflänge", `„${product.lengthRaw}“ enthält kein auswertbares Gewicht.`);
  }
  if (/\bZitronn\b/.test(offer.title)) push("Marke", "Titel schreibt Zitronn.");
  if (product.formRaw && foldSearch(product.formRaw) === "knaul") {
    push("Form", "Form ist als Knäul geschrieben.");
  }
  if (product.materialPhrase && /polyacyl/i.test(product.materialPhrase)) {
    push("Material", "Material schreibt Polyacyl.");
  }
  if (/Farbgruppen/i.test(offer.title) && /\bund\b/i.test(offer.title)) {
    push("Titel", "Farbgruppen sind mit und aneinandergereiht.");
  }
  if (!product.yarn && product.categoryName) {
    push("Kategorie", `Kategorie „${product.categoryName}“ ist keinem Garn zugeordnet.`);
  }

  const description = offer.descriptionHtml ? plainText(offer.descriptionHtml) : "";
  if (description) {
    const foldedDescription = foldSearch(description);
    for (const material of product.materials) {
      const names = Object.entries(MATERIAL_ALIASES)
        .filter(([, canonical]) => canonical === material)
        .map(([alias]) => alias);
      const present = names.some((alias) => foldedDescription.includes(alias));
      if (!present) {
        push("Material", `„${material}“ steht in den Angaben, nicht in der Beschreibung.`);
      }
    }

    const described = new Set<string>();
    for (const match of description.matchAll(/(\d+(?:[.,]\d+)?)\s*%\s*(\p{L}+)/gu)) {
      const fiber = canonicalMaterialToken(match[2] ?? "");
      if (fiber) described.add(fiber);
    }
    for (const fiber of described) {
      if (!product.materials.includes(fiber)) {
        push("Material", `Die Beschreibung nennt ${fiber}, die Materialangabe nicht.`);
      }
    }

    const spec = description.match(/(\d+)\s*m\s*auf\s*(\d+)\s*g/i);
    if (spec) {
      const meters = Number(spec[1]);
      const grams = Number(spec[2]);
      if (product.lengthMeters != null && product.lengthMeters !== meters) {
        push("Lauflänge", `Beschreibung nennt ${meters} m, die Angabe ${product.lengthMeters} m.`);
      }
      if (product.weightGrams != null && product.weightGrams !== grams) {
        push("Gewicht", `Beschreibung nennt ${grams} g, die Angabe ${product.weightGrams} g.`);
      }
    }
  }

  return issues.filter((issue, index, all) => {
    return (
      all.findIndex((other) => other.field === issue.field && other.reason === issue.reason) ===
      index
    );
  });
}
