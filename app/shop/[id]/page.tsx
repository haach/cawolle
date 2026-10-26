import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, Spacing, Typography } from "@/components/atoms";
import { JsonLd } from "@/components/JsonLd";
import { EbayPurchaseLink } from "@/components/shop/EbayPurchaseLink";
import { PhotoGallery } from "@/components/shop/PhotoGallery";
import { OfferMeta } from "@/components/shop/OfferMeta";
import { ShopBackLink } from "@/components/shop/ShopBackLink";
import { readCatalog, readOffer } from "@/lib/catalog";
import { moreFromBrand, productLinks, relatedVariants } from "@/lib/categories";
import { structureDescription } from "@/lib/description";
import { shareMetadata } from "@/lib/metadata";
import { displayHeading, factRows, normalizeOffer, pageTitle, variantLabel } from "@/lib/normalize";
import { breadcrumb, offerDescription, product } from "@/lib/schema";
import styles from "./page.module.css";
import { TagLinkList } from "@/components/atoms/TagLink";

type OfferPageProps = PageProps<"/shop/[id]">;

export const dynamicParams = false;

export function generateStaticParams() {
  return readCatalog().offers.map((offer) => ({ id: offer.id }));
}

export async function generateMetadata({ params }: OfferPageProps): Promise<Metadata> {
  const { id } = await params;
  const offer = readOffer(id);
  if (!offer) {
    return shareMetadata({
      title: "Angebot",
      description: "Dieses Angebot ist bei Cawolle gerade nicht verfügbar.",
      path: "/shop",
    });
  }

  const facts = normalizeOffer(offer);
  return shareMetadata({
    title: pageTitle(facts),
    description: offerDescription(offer),
    path: `/shop/${encodeURIComponent(offer.id)}`,
    image: offer.images[0],
  });
}

export default async function OfferPage({ params }: OfferPageProps) {
  const { id } = await params;
  const offer = readOffer(id);
  if (!offer) notFound();

  const catalog = readCatalog().offers;
  const catalogOffer = catalog.find((item) => item.id === offer.id);
  const facts = normalizeOffer({ ...offer, categoryName: catalogOffer?.categoryName });
  const heading = displayHeading(facts);
  const crumbs = [
    { name: "Startseite", path: "/" },
    { name: "Wolle", path: "/wolle" },
    { name: pageTitle(facts), path: `/shop/${encodeURIComponent(offer.id)}` },
  ];
  const colors = catalogOffer ? relatedVariants(catalogOffer, catalog) : [];
  const others = catalogOffer ? moreFromBrand(catalogOffer, catalog) : [];
  const links = catalogOffer
    ? productLinks({ ...catalogOffer, descriptionHtml: offer.descriptionHtml }, catalog)
    : [];
  const description = structureDescription(offer.descriptionHtml);

  return (
    <article>
      <JsonLd data={[product(offer, facts), breadcrumb(crumbs)]} />

      <Suspense
        fallback={
          <Link href="/shop" className={styles.back}>
            Zurück zum Shop
          </Link>
        }
      >
        <ShopBackLink className={styles.back} />
      </Suspense>
      <div className={styles.layout}>
        <PhotoGallery images={offer.images} title={pageTitle(facts)} />
        <Spacing dir="col" space={20}>
          <Typography variant="h1">{heading}</Typography>
          <OfferMeta
            price={offer.price}
            condition={offer.condition}
            priceVariant="h3"
            conditionVariant="body"
          />
          {factRows(facts).length > 0 && (
            <dl className={styles.aspects}>
              {factRows(facts).map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {offer.itemWebUrl && (
            <Suspense fallback={<Button href={offer.itemWebUrl}>Jetzt auf eBay kaufen</Button>}>
              <EbayPurchaseLink href={offer.itemWebUrl} itemId={offer.id} brand={facts.brand} />
            </Suspense>
          )}
          {links.length > 0 && (
            <TagLinkList links={links.map((link) => ({ href: link.href, children: link.label }))} />
          )}
        </Spacing>
      </div>
      {colors.length > 0 && (
        <section className={styles.related}>
          <Spacing space={15} alignItems="stretch">
            <Typography variant="h2">Weitere Farben</Typography>
            <TagLinkList
              links={colors.map((item) => ({
                href: `/shop/${encodeURIComponent(item.id)}`,
                children: variantLabel(normalizeOffer(item)),
              }))}
            />
          </Spacing>
        </section>
      )}
      {description && (
        <section className={styles.related}>
          <Spacing space={15} alignItems="stretch">
            <Typography variant="h2">Beschreibung</Typography>
            <div className={styles.description} dangerouslySetInnerHTML={{ __html: description }} />
          </Spacing>
        </section>
      )}
      {others.length > 0 && (
        <section className={styles.related}>
          <Spacing space={15} alignItems="stretch">
            <Typography variant="h2">
              {facts.brand ? `Weitere Angebote von ${facts.brand}` : "Weitere Angebote"}
            </Typography>
            <TagLinkList
              links={others.map((item) => ({
                href: `/shop/${encodeURIComponent(item.id)}`,
                children: pageTitle(normalizeOffer(item)),
              }))}
            />
          </Spacing>
        </section>
      )}
      <Typography variant="small" className={styles.listingTitle}>
        Angebotstitel: {offer.title}
      </Typography>
      {offer.aspects.length > 0 && (
        <details className={styles.source}>
          <summary>Angaben von eBay</summary>
          <dl className={styles.aspects}>
            {offer.aspects.map((aspect) => (
              <div key={`${aspect.name}-${aspect.value}`}>
                <dt>{aspect.name}</dt>
                <dd>{aspect.value}</dd>
              </div>
            ))}
          </dl>
        </details>
      )}
    </article>
  );
}
