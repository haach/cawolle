import { Suspense } from "react";
import { Typography } from "@/components/atoms";
import { JsonLd } from "@/components/JsonLd";
import { ShopBrowser } from "@/components/shop/ShopBrowser";
import { readCatalog } from "@/lib/catalog";
import { shareMetadata } from "@/lib/metadata";
import { breadcrumb, shopPage } from "@/lib/schema";
import { siteConfig } from "@/services/site";

export const metadata = shareMetadata({
  title: "Shop",
  description: siteConfig.shopDescription,
  path: "/shop",
});

export default function ShopPage() {
  const catalog = readCatalog();

  return (
    <>
      <JsonLd
        data={[
          shopPage(),
          breadcrumb([
            { name: "Startseite", path: "/" },
            { name: "Shop", path: "/shop" },
          ]),
        ]}
      />
      <Typography variant="h1">Shop</Typography>
      <Suspense fallback={<p>Angebote werden geladen …</p>}>
        <ShopBrowser offers={catalog.offers} />
      </Suspense>
    </>
  );
}
