import { NextResponse } from "next/server";

import { parseAspectParams } from "@/lib/shop";
import { EbayConfigError, EbayRequestError, searchOffers } from "@/services/ebay";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  try {
    const listing = await searchOffers({
      q: searchParams.get("q") ?? "",
      categoryId: searchParams.get("category") ?? "",
      aspects: parseAspectParams(searchParams),
    });
    return NextResponse.json(listing);
  } catch (error) {
    if (error instanceof EbayConfigError) {
      return NextResponse.json({ error: "config" }, { status: 503 });
    }

    const message =
      error instanceof EbayRequestError
        ? error.message
        : "Die Angebote konnten nicht geladen werden.";
    return NextResponse.json({ error: "request", message }, { status: 502 });
  }
}
