import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  colorGroupsFrom,
  factRows,
  normalizeOffer,
  pageTitle,
  qualityIssues,
  summaryLines,
  type NormalizableOffer,
} from "./normalize";
import { matchesQuery, offerMatches } from "./shop";
import type { CatalogOffer } from "./shop";

function offer(partial: {
  id?: string;
  title: string;
  aspects: { name: string; value: string }[];
  descriptionHtml?: string;
  categoryName?: string;
}): CatalogOffer & NormalizableOffer {
  return {
    id: partial.id ?? "1",
    title: partial.title,
    price: "8,00 €",
    imageUrl: null,
    condition: "Neu",
    categoryId: "36589",
    categoryName: partial.categoryName ?? "Bastel- & Künstlerbedarf:Handarbeit:Garne",
    aspects: partial.aspects,
    descriptionHtml: partial.descriptionHtml,
  };
}

describe("color display", () => {
  it("keeps a manufacturer number apart from color groups", () => {
    const product = normalizeOffer(
      offer({
        title:
          "Zitron Trekking XXL, Sockengarn 4 fach Color, Farbgruppen Rot und Rosa und Pink, 72",
        aspects: [
          { name: "Farbe", value: "72" },
          { name: "Marke", value: "Zitron" },
          { name: "Produktart", value: "Farbverlaufswolle" },
          { name: "Form", value: "Knäuel" },
          { name: "Material", value: "Schurwolle und Polyacryl" },
          { name: "Lauflänge", value: "420 m auf 100 g" },
        ],
      }),
    );

    assert.equal(product.brand, "Zitron");
    assert.equal(product.line, "Trekking XXL");
    assert.equal(product.colorNumber, "72");
    assert.deepEqual(product.colorGroups, ["Rot", "Rosa", "Pink"]);
    assert.equal(product.colorDescription, null);
    assert.equal(product.gradient, true);
    assert.deepEqual(summaryLines(product).slice(0, 2), ["Farbe: 72", "Rot / Rosa / Pink"]);
    assert.equal(pageTitle(product), "Zitron Trekking XXL, Farbe 72, Rot / Rosa / Pink");
    assert.equal(
      factRows(product).some((row) => row.value.includes("Farbgruppen")),
      false,
    );
  });

  it("does not invent a color from a number", () => {
    const product = normalizeOffer(
      offer({
        title: "Zitronn Trekking XXL, Sockengarn 4fach Color, bunte Knaller, 73",
        aspects: [
          { name: "Farbe", value: "73" },
          { name: "Marke", value: "Zitron" },
          { name: "Produktart", value: "Farbverlaufswolle" },
          { name: "Form", value: "Knäuel" },
          { name: "Material", value: "Schurwolle und Polyacryl" },
        ],
      }),
    );

    assert.equal(product.colorNumber, "73");
    assert.deepEqual(product.colorGroups, []);
    assert.equal(product.colorDescription, null);
    assert.deepEqual(summaryLines(product), ["Farbe: 73", "Farbverlauf"]);
  });

  it("reads a number and a color name from the title", () => {
    const product = normalizeOffer(
      offer({
        title: "Katia Cotton Cord, Baumwolle, Farbe 56 Orange",
        aspects: [
          { name: "Marke", value: "Katia" },
          { name: "Farbe", value: "Orange" },
          { name: "Produktart", value: "Kräftiges Garn" },
          { name: "Material", value: "Baumwolle" },
          { name: "Form", value: "Ball" },
          { name: "Lauflänge", value: "50 m auf 50 g" },
        ],
      }),
    );

    assert.equal(product.colorNumber, "56");
    assert.equal(product.colorDescription, "Orange");
    assert.deepEqual(summaryLines(product), ["Farbe: 56", "Orange"]);
    assert.equal(product.gradient, false);
    assert.equal(product.form, "Knäuel");
    assert.equal(product.weightGrams, 50);
    assert.equal(product.lengthMeters, 50);
  });

  it("reports a color conflict without choosing a winner", () => {
    const listing = offer({
      id: "aurora",
      title: "Lang Yarns Aurora, Colorgarn aus Baumwolle, Farbe 46 Schwarz-Taupe",
      aspects: [
        { name: "Marke", value: "Lang Yarns" },
        { name: "Farbe", value: "Schwarz-Taupe-Weinrot" },
        { name: "Produktart", value: "Effektgarn" },
        { name: "Material", value: "Baumwolle mit Acetat" },
      ],
    });
    const product = normalizeOffer(listing);

    assert.equal(product.colorConflict, true);
    assert.equal(product.colorNumber, "46");
    assert.equal(product.titleColor, "Schwarz-Taupe");
    assert.equal(product.aspectColor, "Schwarz-Taupe-Weinrot");
    assert.deepEqual(summaryLines(product).slice(0, 3), [
      "Farbe: 46",
      "Schwarz-Taupe",
      "Schwarz-Taupe-Weinrot",
    ]);
    assert.equal(
      qualityIssues(listing).some((issue) => issue.field === "Farbe" && issue.id === "aurora"),
      true,
    );
  });

  it("does not treat the brand Zitron as yellow", () => {
    assert.deepEqual(colorGroupsFrom("Zitron"), []);
  });

  it("does not treat Frost as Rost, and keeps Primrose yellow", () => {
    assert.deepEqual(colorGroupsFrom("Frost"), []);
    assert.deepEqual(colorGroupsFrom("Rost"), ["Orange"]);
    assert.deepEqual(colorGroupsFrom("Frostrosa"), ["Rosa"]);
    assert.deepEqual(colorGroupsFrom("Primrose"), ["Gelb"]);
    assert.equal(colorGroupsFrom("Primrose").includes("Rosa"), false);
  });
});

describe("normalization", () => {
  it("normalizes packaging, typos, and a real needle size", () => {
    const listing = offer({
      title: "Lang Yarns Nelly, Baumwolle mit Polyacryl, Farbe 20 Hellblau",
      aspects: [
        { name: "Marke", value: "Lang Yarns" },
        { name: "Farbe", value: "Hellblau" },
        { name: "Form", value: "Knäul" },
        { name: "Material", value: "Baumwolle mit Polyacyl" },
        { name: "Produktart", value: "Mischgarn" },
      ],
      descriptionHtml: "<p>Nadelstärke 3,0 – 3,5 Maschenprobe 22 M.</p>",
    });
    const product = normalizeOffer(listing);

    assert.equal(product.form, "Knäuel");
    assert.deepEqual(product.materials, ["Baumwolle", "Polyacryl"]);
    assert.equal(product.needle, "3,0 – 3,5");
    assert.equal(product.colorDescription, "Hellblau");
    assert.deepEqual(product.colorGroups, ["Blau"]);
    const issues = qualityIssues(listing);
    assert.equal(
      issues.some((issue) => issue.field === "Form"),
      true,
    );
    assert.equal(
      issues.some((issue) => issue.reason.includes("Polyacyl")),
      true,
    );
  });

  it("ignores prose that only mentions needle size", () => {
    const product = normalizeOffer(
      offer({
        title: "Katia Aire, Mohair und Alpaca, verschiedene Farben, Grau",
        aspects: [
          { name: "Marke", value: "Katia" },
          { name: "Farbe", value: "Grau" },
          { name: "Material", value: "Mohair mit Alpaca" },
          { name: "Produktart", value: "Flauschgarn" },
        ],
        descriptionHtml: "<p>Mit der richtigen Nadelstärke kommen Sie außerdem gut voran.</p>",
      }),
    );

    assert.equal(product.needle, null);
    assert.deepEqual(product.materials, ["Mohair", "Alpaka"]);
  });

  it("does not make a color number a gradient", () => {
    const product = normalizeOffer(
      offer({
        title: "Katia Merino Super-Sport, Merino Extrafine, Farbe 12 Grau",
        aspects: [
          { name: "Farbe", value: "Grau" },
          { name: "Marke", value: "Katia" },
          { name: "Produktart", value: "Schnellstrickgarn" },
          { name: "Material", value: "Merino" },
        ],
      }),
    );

    assert.equal(product.gradient, false);
    assert.equal(product.colorNumber, "12");
    assert.equal(product.sockYarn, false);
  });
});

describe("search", () => {
  it("matches umlauts, eszett, and a color number", () => {
    const grun = offer({
      title: "Katia Soho, Effektgarn in verschiedenen Farben, Grün",
      aspects: [
        { name: "Farbe", value: "Grün" },
        { name: "Marke", value: "Katia" },
      ],
    });
    const weiss = offer({
      title: "Zitron Trekking XXL, Kombis mit Weiss, 803",
      aspects: [
        { name: "Farbe", value: "803" },
        { name: "Marke", value: "Zitron" },
      ],
    });

    assert.equal(matchesQuery(grun, "grun"), true);
    assert.equal(matchesQuery(grun, "GRÜN"), true);
    assert.equal(matchesQuery(weiss, "weiss"), true);
    assert.equal(matchesQuery(weiss, "72"), false);
    assert.equal(matchesQuery(weiss, "803"), true);
    assert.equal(offerMatches(grun, { Farbe: ["Grün"] }), true);
    assert.equal(offerMatches(weiss, { Farbe: ["Farbverlauf"] }), false);
    assert.equal(offerMatches(weiss, { "Farbverlaufs-Nummer": ["803"] }), true);
  });
});
