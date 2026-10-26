import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryLanding } from "@/components/shop/CategoryLanding";
import { readCatalog } from "@/lib/catalog";
import { sockPage } from "@/lib/categories";
import { shareMetadata } from "@/lib/metadata";

export function generateMetadata(): Metadata {
  const page = sockPage(readCatalog().offers);
  if (!page) return {};
  return shareMetadata({
    title: page.metaTitle,
    description: page.description,
    path: page.path,
    image: page.offers[0]?.imageUrl ?? undefined,
  });
}

export default function SockYarnPage() {
  const page = sockPage(readCatalog().offers);
  if (!page) notFound();
  return <CategoryLanding page={page} />;
}
