import type { Metadata } from "next";
import { Typography } from "@/components/atoms";

export const metadata: Metadata = {
  title: "Shop",
};

export default function ShopPage() {
  return <Typography variant="h1">Shop</Typography>;
}
