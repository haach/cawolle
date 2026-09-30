"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Typography } from "@/components/atoms";
import { parseAspectParams, type ShopListing } from "@/lib/shop";
import { OfferFilters } from "./OfferFilters";
import { OfferList } from "./OfferList";
import styles from "./ShopBrowser.module.css";

type Problem = "config" | "request" | null;

export function ShopBrowser() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const query = searchParams.get("q") ?? "";
  const categoryId = searchParams.get("category") ?? "";
  const selected = parseAspectParams(searchParams);
  const serialized = searchParams.toString();
  const [draft, setDraft] = useState(query);
  const [seenQuery, setSeenQuery] = useState(query);
  const [listing, setListing] = useState<ShopListing | null>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [problem, setProblem] = useState<Problem>(null);
  const [message, setMessage] = useState("");
  const loading = loadedKey !== serialized;

  if (query !== seenQuery) {
    setSeenQuery(query);
    setDraft(query);
  }

  useEffect(() => {
    const handle = window.setTimeout(() => {
      if (draft === query) return;
      const next = new URLSearchParams(searchParams.toString());
      if (draft.trim()) next.set("q", draft.trim());
      else next.delete("q");
      const serialized = next.toString();
      router.replace(serialized ? `${pathname}?${serialized}` : pathname, { scroll: false });
    }, 300);

    return () => window.clearTimeout(handle);
  }, [draft, pathname, query, router, searchParams]);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/shop/offers${serialized ? `?${serialized}` : ""}`, { signal: controller.signal })
      .then(async (response) => {
        const body = (await response.json()) as ShopListing & { error?: string; message?: string };
        if (!response.ok) {
          setListing(null);
          setProblem(body.error === "config" ? "config" : "request");
          setMessage(body.message ?? "Die Angebote konnten nicht geladen werden.");
          return;
        }
        setProblem(null);
        setListing(body);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setProblem("request");
        setMessage("Die Angebote konnten nicht geladen werden.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadedKey(serialized);
      });

    return () => controller.abort();
  }, [serialized]);

  function replace(next: URLSearchParams) {
    const serialized = next.toString();
    router.replace(serialized ? `${pathname}?${serialized}` : pathname, { scroll: false });
  }

  function setCategory(id: string) {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("aspect");
    if (id) next.set("category", id);
    else next.delete("category");
    replace(next);
  }

  function toggleAspect(name: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    const current = parseAspectParams(next);
    const values = new Set(current[name] ?? []);
    if (values.has(value)) values.delete(value);
    else values.add(value);

    const updated = { ...current, [name]: [...values] };
    next.delete("aspect");
    for (const [aspectName, aspectValues] of Object.entries(updated)) {
      for (const aspectValue of aspectValues) {
        next.append("aspect", `${aspectName}:${aspectValue}`);
      }
    }

    if (!next.get("category") && listing?.refinements.categoryId) {
      next.set("category", listing.refinements.categoryId);
    }
    replace(next);
  }

  const hasFilters =
    (listing?.refinements.categories.length ?? 0) > 0 ||
    (listing?.refinements.aspects.length ?? 0) > 0;
  const offerCount = listing?.offers.length ?? 0;

  if (problem === "config") {
    return (
      <div className={styles.notice}>
        <Typography variant="body" weight="regular">
          Der Shop ist noch nicht mit eBay verbunden. Tragen Sie in <code>.env.local</code> die
          Werte aus dem eBay-Entwicklerkonto ein. Die Namen stehen in <code>.env.example</code>:
          EBAY_CLIENT_ID, EBAY_CLIENT_SECRET und EBAY_SELLER_USERNAME. Für den echten Shop die
          Production-Schlüssel verwenden und den Server danach neu starten.
        </Typography>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      {hasFilters && (
        <OfferFilters
          categories={listing?.refinements.categories ?? []}
          aspects={listing?.refinements.aspects ?? []}
          categoryId={categoryId}
          selected={selected}
          onCategory={setCategory}
          onToggle={toggleAspect}
        />
      )}
      <div className={styles.results}>
        {/* <label className={styles.search}>
          <span className={styles.label}>Suche</span>
          <input
            className={styles.control}
            type="search"
            value={draft}
            placeholder="Zum Beispiel Sockenwolle"
            onChange={(event) => setDraft(event.target.value)}
          />
        </label> */}
        {problem === "request" && (
          <p className={styles.error} role="alert">
            {message}
          </p>
        )}
        {loading && <p className={styles.status}>Angebote werden geladen …</p>}
        {listing && listing.offers.length === 0 && !loading && (
          <p className={styles.status}>Keine Angebote für diese Auswahl.</p>
        )}
        {listing && listing.offers.length > 0 && (
          <>
            <p className={styles.count}>
              {offerCount === 1 ? "1 Angebot" : `${offerCount} Angebote`}
            </p>
            <div aria-busy={loading}>
              <OfferList offers={listing.offers} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
