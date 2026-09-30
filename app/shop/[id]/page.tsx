import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, Typography } from "@/components/atoms";
import { JsonLd } from "@/components/JsonLd";
import { PhotoGallery } from "@/components/shop/PhotoGallery";
import { OfferMeta } from "@/components/shop/OfferMeta";
import { readCatalog, readOffer } from "@/lib/catalog";
import { shareMetadata } from "@/lib/metadata";
import { breadcrumb, offerDescription, product } from "@/lib/schema";
import styles from "./page.module.css";

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

  return shareMetadata({
    title: offer.title,
    description: offerDescription(offer),
    path: `/shop/${encodeURIComponent(offer.id)}`,
    image: offer.images[0],
  });
}

export default async function OfferPage({ params }: OfferPageProps) {
  const { id } = await params;
  const offer = readOffer(id);
  if (!offer) notFound();

  const productSchema = product(offer);

  return (
    <article>
      <JsonLd
        data={[
          ...(productSchema ? [productSchema] : []),
          breadcrumb([
            { name: "Startseite", path: "/" },
            { name: "Shop", path: "/shop" },
            { name: offer.title, path: `/shop/${encodeURIComponent(offer.id)}` },
          ]),
        ]}
      />
      <Link href="/shop" className={styles.back}>
        Zurück zum Shop
      </Link>
      <div className={styles.layout}>
        <PhotoGallery images={offer.images} title={offer.title} />
        <div className={styles.summary}>
          <Typography variant="h1">{offer.title}</Typography>
          <OfferMeta
            price={offer.price}
            condition={offer.condition}
            priceClassName={styles.price}
            conditionClassName={styles.condition}
          />
          {offer.aspects.length > 0 && (
            <dl className={styles.aspects}>
              {offer.aspects.map((aspect) => (
                <div key={`${aspect.name}-${aspect.value}`}>
                  <dt>{aspect.name}</dt>
                  <dd>{aspect.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {offer.itemWebUrl && <Button href={offer.itemWebUrl}>Jetzt auf eBay kaufen</Button>}
        </div>
      </div>
      {offer.descriptionHtml && (
        <div
          className={styles.description}
          dangerouslySetInnerHTML={{ __html: offer.descriptionHtml }}
        />
      )}
    </article>
  );
}
