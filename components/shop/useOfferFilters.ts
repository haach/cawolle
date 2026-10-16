"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  aspectRefinements,
  matchesQuery,
  offerMatches,
  parseAspectParams,
  shopFilterQuery,
  withColorway,
  withQuery,
  withToggledAspect,
  withoutAspects,
  type CatalogOffer,
} from "@/lib/shop";

export function useOfferFilters(offers: CatalogOffer[]) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const query = searchParams.get("q") ?? "";
  const filterQuery = shopFilterQuery(searchParams);
  const selected = parseAspectParams(searchParams);
  const aspects = aspectRefinements(offers);
  const visible = offers.filter(
    (offer) => matchesQuery(offer, query) && offerMatches(offer, selected),
  );

  const replace = (next: URLSearchParams) => {
    const serialized = next.toString();
    router.replace(serialized ? `${pathname}?${serialized}` : pathname, { scroll: false });
  };

  const setQuery = (value: string) => replace(withQuery(searchParams, value));
  const toggleAspect = (name: string, value: string) =>
    replace(withToggledAspect(searchParams, name, value));
  const setColorway = (value: string) => replace(withColorway(searchParams, value));
  const resetFilters = () => replace(withoutAspects(searchParams));
  const clearSelection = () => {
    const next = withoutAspects(searchParams);
    next.delete("q");
    replace(next);
  };

  return {
    query,
    filterQuery,
    selected,
    aspects,
    visible,
    setQuery,
    toggleAspect,
    setColorway,
    resetFilters,
    clearSelection,
  };
}
