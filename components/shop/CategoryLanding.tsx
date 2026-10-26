import type { FC } from "react";
import { Spacing, Typography } from "@/components/atoms";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import type { CategoryPage } from "@/lib/categories";
import { breadcrumb, collectionPage } from "@/lib/schema";
import { OfferList } from "./OfferList";
import { TagLinkList } from "../atoms/TagLink";

type CategoryLandingProps = {
  page: CategoryPage;
};

export const CategoryLanding: FC<CategoryLandingProps> = ({ page }) => (
  <>
    <JsonLd
      data={[
        collectionPage({ name: page.heading, path: page.path, description: page.description }),
        breadcrumb(page.crumbs),
      ]}
    />
    <Breadcrumbs items={page.crumbs} />
    <Spacing dir="col" space={20}>
      <Typography variant="h1">{page.heading}</Typography>
      <Typography variant="body">
        {page.offers.length === 1
          ? "1 passendes Angebot"
          : `${page.offers.length} passende Angebote`}
      </Typography>
      {page.related.length > 0 && (
        <nav aria-label="Verwandte Kategorien">
          <TagLinkList
            links={page.related.map((link) => ({ href: link.href, children: link.label }))}
          />
        </nav>
      )}
      <OfferList offers={page.offers} filterQuery="" />
    </Spacing>
  </>
);
