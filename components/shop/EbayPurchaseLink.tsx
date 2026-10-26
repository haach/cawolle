"use client";

import type { FC } from "react";
import { track } from "@vercel/analytics";
import { useSearchParams } from "next/navigation";
import { ExternalLink } from "@/components/atoms";
import styles from "@/components/atoms/Button.module.css";

type EbayPurchaseLinkProps = {
  href: string;
  itemId: string;
  brand: string | null;
};

export const EbayPurchaseLink: FC<EbayPurchaseLinkProps> = ({ href, itemId, brand }) => {
  const query = useSearchParams().get("q") ?? "";

  return (
    <ExternalLink
      href={href}
      className={`${styles.button} ${styles.pill}`}
      onClick={() => {
        track("ebay_click", {
          item: itemId,
          brand: brand ?? "",
          path: window.location.pathname,
          q: query,
        });
      }}
    >
      Jetzt auf eBay kaufen
    </ExternalLink>
  );
};
