import type { FC } from "react";

type OfferMetaProps = {
  price: string | null;
  condition: string | null;
  priceClassName: string;
  conditionClassName: string;
};

export const OfferMeta: FC<OfferMetaProps> = ({
  price,
  condition,
  priceClassName,
  conditionClassName,
}) => (
  <>
    {price ? <span className={priceClassName}>{price}</span> : null}
    {condition ? <span className={conditionClassName}>{condition}</span> : null}
  </>
);
