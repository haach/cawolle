import type { Metadata } from "next";
import { Suspense } from "react";
import { Typography } from "@/components/atoms";
import { ShopBrowser } from "@/components/shop/ShopBrowser";

export const metadata: Metadata = {
  title: "Shop",
  description: "Aktuelle Angebote von Cawolle. Bestellung und Zahlung laufen über eBay.",
};

export default function ShopPage() {
  return (
    <>
      <Typography variant="h1">Shop</Typography>
      <Suspense fallback={<p>Angebote werden geladen …</p>}>
        <ShopBrowser />
      </Suspense>
    </>
  );
}
