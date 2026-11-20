import { useQuery } from "@tanstack/react-query";
import type { Listing } from "@/lib/supabase";
import { totalPrice } from "@/lib/listing-pricing";

// Per-listing currency. Admin chooses USD or EGP for every listing; the
// price entered IS that currency and is never converted in the database.
// The USD→EGP rate below is only used to show "≈ EGP" and to compare,
// filter and sort prices across currencies.
// Older listings created before this field existed have no `currency` value,
// so we default to EGP to preserve their original display.
export type Currency = "EGP" | "USD";

export const CURRENCY_OPTIONS: { value: Currency; label: string }[] = [
  { value: "EGP", label: "EGP" },
  { value: "USD", label: "USD" },
];

// The currency code to display for a listing, defaulting to EGP for legacy
// rows where the field is null/empty.
export function listingCurrency(listing: Pick<Listing, "currency">): Currency {
  return listing.currency === "USD" ? "USD" : "EGP";
}

// Used until the live rate loads (or if /api/fx/usd-egp is unreachable).
// The live rate comes from the server (server/fx.ts): refreshed daily from a
// rate API, or the admin's manual override.
export const DEFAULT_USD_EGP_RATE = 56.09; // 2026-10-28

export interface UsdEgpRate {
  rate: number;
  kind: "auto" | "manual" | "fallback";
  asOf: string | null;
}

const FALLBACK: UsdEgpRate = { rate: DEFAULT_USD_EGP_RATE, kind: "fallback", asOf: null };

// Latest known rate for plain functions called outside React (kept in sync by
// useUsdEgpRate). Components should prefer the hook so they re-render.
let latest: UsdEgpRate = FALLBACK;
export const currentUsdEgpRate = () => latest.rate;

async function fetchRate(): Promise<UsdEgpRate> {
  const res = await fetch("/api/fx/usd-egp");
  if (!res.ok) throw new Error(`fx ${res.status}`);
  const body = (await res.json()) as UsdEgpRate;
  if (!(body.rate > 0)) throw new Error("bad rate");
  latest = body;
  return body;
}

/** The live USD→EGP rate; the fallback constant until it loads. */
export function useUsdEgpRate(): UsdEgpRate {
  const { data } = useQuery({
    queryKey: ["fx", "usd-egp"],
    queryFn: fetchRate,
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });
  return data ?? latest;
}

/** "19 Nov" for the rate date, or "" when unknown. */
export function formatRateDate(asOf: string | null): string {
  if (!asOf) return "";
  const d = new Date(asOf);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/** The listing's TOTAL price (indoor + extra area, see listing-pricing.ts)
 *  normalised to EGP, or null when it has no price. */
export function priceInEgp(
  listing: Pick<Listing, "price" | "currency"> &
    Partial<Pick<Listing, "price_per_meter" | "area_sqm" | "outdoor_area_sqm" | "outdoor_price_per_meter" | "outdoor_area_type" | "price_is_lump_sum">>,
  rate = latest.rate,
): number | null {
  const p = totalPrice(listing);
  if (p <= 0) return null;
  return listingCurrency(listing) === "USD" ? Math.round(p * rate) : p;
}

/** "EGP 1.2M", "EGP 850K" — short form for the "≈ EGP" hint on USD listings. */
export function formatEgpShort(value: number): string {
  if (value >= 1_000_000) return `EGP ${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
  if (value >= 1_000) return `EGP ${Math.round(value / 1_000)}K`;
  return `EGP ${value}`;
}
