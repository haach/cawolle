import type { Metadata } from "next";
import { Suspense } from "react";
import { Typography } from "@/components/atoms";
import { JsonLd } from "@/components/JsonLd";
import { ShopBrowser } from "@/components/shop/ShopBrowser";
import { readCatalog } from "@/lib/catalog";
import { shareMetadata } from "@/lib/metadata";
import { breadcrumb, shopPage } from "@/lib/schema";
import { siteConfig } from "@/services/site";

type ShopPageProps = {
  searchParams: Promise<{ q?: string | string[]; aspect?: string | string[] }>;
};

function filtered(params: { q?: string | string[]; aspect?: string | string[] }) {
  const query = Array.isArray(params.q) ? params.q.join(" ") : params.q;
  if (query?.trim()) return true;
  const aspect = params.aspect;
  if (Array.isArray(aspect)) return aspect.some((value) => value.trim());
  return Boolean(aspect?.trim());
}

export async function generateMetadata({ searchParams }: ShopPageProps): Promise<Metadata> {
  const params = await searchParams;
  const metadata = shareMetadata({
    title: "Wolle, Garn und Zubehör",
    description: siteConfig.shopDescription,
    path: "/shop",
  });
  if (!filtered(params)) return metadata;
  return { ...metadata, robots: { index: false, follow: true } };
}

export default function ShopPage() {
  const catalog = readCatalog();

  return (
    <>
      <JsonLd
        data={[
          shopPage(),
          breadcrumb([
            { name: "Startseite", path: "/" },
            { name: "Wolle und Garn", path: "/shop" },
          ]),
        ]}
      />
      <Typography variant="h1">Wolle und Garn</Typography>
      <Suspense fallback={<Typography>Angebote werden geladen …</Typography>}>
        <ShopBrowser offers={catalog.offers} />
      </Suspense>
    </>
  );
}
