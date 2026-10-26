import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryLanding } from "@/components/shop/CategoryLanding";
import { readCatalog } from "@/lib/catalog";
import { materialPages } from "@/lib/categories";
import { shareMetadata } from "@/lib/metadata";

type MaterialPageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return materialPages(readCatalog().offers).map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: MaterialPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = materialPages(readCatalog().offers).find((entry) => entry.slug === slug);
  if (!page) return {};
  return shareMetadata({
    title: page.metaTitle,
    description: page.description,
    path: page.path,
    image: page.offers[0]?.imageUrl ?? undefined,
  });
}

export default async function MaterialPage({ params }: MaterialPageProps) {
  const { slug } = await params;
  const page = materialPages(readCatalog().offers).find((entry) => entry.slug === slug);
  if (!page) notFound();
  return <CategoryLanding page={page} />;
}
