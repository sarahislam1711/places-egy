// GA4 event helper. Safe to call before gtag has loaded — just no-ops in that
// case (and in environments without window, e.g. SSR).
//
// Events fire even when consent is "denied" because GA4 stores them as
// consent-aware pings; they only become attributable to a user once the user
// accepts cookies via the banner.

import { currentUsdEgpRate, listingCurrency, priceInEgp } from "@/lib/currency";

type GtagFn = (...args: unknown[]) => void;

function getGtag(): GtagFn | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { gtag?: GtagFn }).gtag;
}

export function trackEvent(name: string, params: Record<string, unknown> = {}): void {
  const gtag = getGtag();
  if (typeof gtag === "function") {
    gtag("event", name, params);
  }
}

// Source labels for click events — keeps GA4 reports consistent so you can
// slice "where do calls come from" without typo'd values.
export type ContactSource =
  | "listing_modal"
  | "listing_detail"
  | "contact_page";

/**
 * Standard params for listing events. `listing_price` is the typed (indoor)
 * price in `currency`; `price_egp` is the all-in total converted to EGP so
 * values from USD and EGP listings can be compared in GA4.
 */
export function listingEventParams(listing: {
  id: unknown; title?: string | null; location?: string | null; price?: number | null;
  currency?: string | null; transaction_type?: string | null;
}): Record<string, unknown> {
  return {
    listing_id: listing.id,
    listing_title: listing.title,
    listing_location: listing.location,
    listing_price: listing.price,
    currency: listingCurrency(listing as Parameters<typeof listingCurrency>[0]),
    price_egp: priceInEgp(listing as Parameters<typeof priceInEgp>[0], currentUsdEgpRate()),
    transaction_type: listing.transaction_type,
  };
}
