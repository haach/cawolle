import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, Typography } from "@/components/atoms";
import { JsonLd } from "@/components/JsonLd";
import { PhotoGallery } from "@/components/shop/PhotoGallery";
import { shareMetadata } from "@/lib/metadata";
import { breadcrumb, offerDescription, product } from "@/lib/schema";
import type { OfferDetail } from "@/lib/shop";
import { EbayConfigError, EbayRequestError, getOffer } from "@/services/ebay";
import styles from "./page.module.css";

type OfferPageProps = PageProps<"/shop/[id]">;

export async function generateMetadata({ params }: OfferPageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const offer = await getOffer(id);
    return shareMetadata({
      title: offer.title,
      description: offerDescription(offer),
      path: `/shop/${encodeURIComponent(offer.id)}`,
      image: offer.images[0],
    });
  } catch {
    return shareMetadata({
      title: "Angebot",
      description: "Dieses Angebot ist bei Cawolle gerade nicht verfügbar.",
      path: "/shop",
    });
  }
}

async function loadOffer(
  id: string,
): Promise<{ offer: OfferDetail | null; message: string | null }> {
  try {
    return { offer: await getOffer(id), message: null };
  } catch (error) {
    if (error instanceof EbayRequestError && error.status === 404) {
      return { offer: null, message: null };
    }

    const message =
      error instanceof EbayConfigError
        ? "Der Shop ist noch nicht mit eBay verbunden."
        : error instanceof EbayRequestError
          ? error.message
          : "Das Angebot konnte nicht geladen werden.";

    return { offer: null, message };
  }
}

export default async function OfferPage({ params }: OfferPageProps) {
  const { id } = await params;
  const { offer, message } = await loadOffer(id);

  if (!offer && !message) notFound();

  if (!offer) {
    return (
      <article className={styles.fallback}>
        <Typography variant="h1">Angebot</Typography>
        <p>{message}</p>
        <Link href="/shop" className={styles.back}>
          Zurück zum Shop
        </Link>
      </article>
    );
  }

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
          {offer.price && <p className={styles.price}>{offer.price}</p>}
          {offer.condition && <p className={styles.condition}>{offer.condition}</p>}
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
