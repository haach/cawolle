import type { FC } from "react";
import { Button, Spacing, Typography } from "@/components/atoms";
import { Section } from "@/components/Section";
import { OfferList } from "@/components/shop/OfferList";
import { readCatalog } from "@/lib/catalog";
import { featuredOffers } from "@/lib/categories";

export const Discover: FC = () => {
  const featured = featuredOffers(readCatalog().offers);

  return (
    <Section title="Wolle und Garn" heading="h1" align="start">
      <Spacing space={40}>
        <Spacing space={20} alignItems="start" justifyContent="start">
          <Typography variant="body">
            Wir führen ein diverses Sortiment an Wolle und Garn zum Stricken und Häkeln. Stöbern Sie
            nach Material, Marke und Farbe.
          </Typography>
          <Button href="/shop">Wolle, Garn und Zubehör entdecken</Button>
        </Spacing>
        {featured.length > 0 && (
          <Spacing space={20}>
            <Typography variant="h2">Aktuelle Angebote</Typography>
            <OfferList offers={featured} filterQuery="" />
          </Spacing>
        )}
      </Spacing>
    </Section>
  );
};
