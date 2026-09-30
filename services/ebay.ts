import { cache } from "react";
import "server-only";

import { EbayConfigError, EbayRequestError, fetchOffer, searchOffers } from "./ebay-api";

export { EbayConfigError, EbayRequestError, searchOffers };

export const getOffer = cache(fetchOffer);
