"use client";

import type { FC } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { shopFilterQuery, withFilterQuery } from "@/lib/shop";

type ShopBackLinkProps = {
  className?: string;
};

export const ShopBackLink: FC<ShopBackLinkProps> = ({ className }) => (
  <Link href={withFilterQuery("/shop", shopFilterQuery(useSearchParams()))} className={className}>
    Zurück zum Shop
  </Link>
);
