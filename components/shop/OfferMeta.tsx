import type { FC } from "react";
import { Typography } from "@/components/atoms";

type OfferMetaProps = {
  price: string | null;
  condition: string | null;
  priceVariant?: "body" | "h3";
  conditionVariant?: "body" | "small";
};

export const OfferMeta: FC<OfferMetaProps> = ({
  price,
  condition,
  priceVariant = "body",
  conditionVariant = "small",
}) => (
  <>
    {price ? (
      <Typography as="span" variant={priceVariant} color="brand" weight="semibold">
        {price}
      </Typography>
    ) : null}
    {condition ? (
      <Typography as="span" variant={conditionVariant}>
        {condition}
      </Typography>
    ) : null}
  </>
);
