// One-way sync of PLACES rent listings to Hotdesk's marketplace.
// PLACES is the source of truth; Hotdesk mirrors it. Rule: transaction_type
// "rent" and not a test listing → on Hotdesk; anything else → removed there.
//
// HOTDESK_SYNC_MODE: "off" (default) | "preview" (log what would be sent) |
// "live" (call Hotdesk — wired once their API docs arrive).
import {
  DEVELOPER_OPTIONS,
  FURNISHING_OPTIONS,
  LOCATION_OPTIONS,
  MAINTENANCE_STATUS_OPTIONS,
  SUBTYPE_OPTIONS,
  getEnumLabel,
} from "../client/src/lib/enums";
import { cleanListingTitle, listingSnippet } from "../client/src/lib/listing-text";
import { canonicalListingPath } from "./listing-redirect";

const SITE = "https://places-egy.com";

export type HotdeskMode = "off" | "preview" | "live";

export function hotdeskMode(): HotdeskMode {
  const m = (process.env.HOTDESK_SYNC_MODE ?? "off").toLowerCase();
  return m === "preview" || m === "live" ? m : "off";
}

export interface ListingRow {
  id: number;
  title: string | null;
  description: string | null;
  transaction_type: string | null;
  property_type: string | null;
  subtype: string | null;
  developer: string | null;
  project: string | null;
  location: string | null;
  location_area: string | null;
  street_name?: string | null;
  building_name?: string | null;
  price: number | null;
  currency: string | null;
  price_per_meter: number | null;
  area_sqm: number | null;
  outdoor_area_sqm?: number | null;
  outdoor_price_per_meter?: number | null;
  outdoor_area_type?: string | null;
  price_is_lump_sum?: boolean | null;
  floor: number | null;
  parking: number | null;
  furnishing: string | null;
  maintenance_fees: number | null;
  maintenance_status: string | null;
  delivery_date: string | null;
  images: string[] | null;
  is_test?: boolean | null;
  rental_status?: "available" | "rented" | null;
  rental_start?: string | null;
  rental_end?: string | null;
}

export function isHotdeskEligible(l: Pick<ListingRow, "transaction_type" | "is_test">): boolean {
  return (l.transaction_type ?? "").toLowerCase() === "rent" && !l.is_test;
}

// Prefer the pre-sized 1600px WebP (server/image-variants.ts) over the raw upload.
function hotdeskPhoto(url: string): string {
  return url.replace(/(\/listings-images\/\d{13}-[a-z0-9]{6})\.[a-z0-9]+$/i, "$1.w1600.webp");
}

const label = (opts: Parameters<typeof getEnumLabel>[0], v: string | null) =>
  v ? getEnumLabel(opts, v) || v : null;

// Our side of the field contract. Mapped to Hotdesk's field names once their docs arrive.
export function toHotdeskListing(l: ListingRow) {
  const rented = l.rental_status === "rented";
  return {
    external_id: String(l.id),
    title: cleanListingTitle(l.title ?? ""),
    summary: listingSnippet(l.description ?? "", 300),
    places_url: `${SITE}${canonicalListingPath(l)}`,
    price: l.price,
    currency: l.currency || "EGP",
    price_period: "month",
    price_per_sqm: l.price_per_meter,
    area_sqm: l.area_sqm,
    floor: l.floor,
    parking_spaces: l.parking,
    finishing: label(FURNISHING_OPTIONS, l.furnishing),
    maintenance_fees: l.maintenance_fees,
    maintenance: label(MAINTENANCE_STATUS_OPTIONS, l.maintenance_status),
    property_type: label(SUBTYPE_OPTIONS, l.subtype),
    location: label(LOCATION_OPTIONS, l.location),
    area: l.location_area,
    developer: label(DEVELOPER_OPTIONS, l.developer),
    project: l.project,
    delivery_date: l.delivery_date,
    photos: (l.images ?? []).filter(Boolean).map(hotdeskPhoto),
    availability: {
      status: rented ? "rented" : "available",
      rented_since: rented ? l.rental_start ?? null : null,
      available_from: rented ? l.rental_end ?? null : null,
      available_date_to_be_confirmed: rented && !l.rental_end,
    },
  };
}

export type HotdeskListing = ReturnType<typeof toHotdeskListing>;

// Data problems that would make a poor or rejected listing on Hotdesk.
export function hotdeskWarnings(p: HotdeskListing): string[] {
  const w: string[] = [];
  if (!p.title) w.push("missing title");
  if (!p.price) w.push("missing price");
  if (!p.area_sqm) w.push("missing size");
  if (!p.location) w.push("missing location");
  if (p.photos.length === 0) w.push("no photos");
  if (!p.summary) w.push("no description");
  return w;
}

export type HotdeskAction = "upsert" | "remove";

// Never throws and never blocks the admin save that triggered it.
export function syncListingToHotdesk(
  listing: ListingRow | null,
  id: number,
  reason: "created" | "updated" | "deleted",
): void {
  const mode = hotdeskMode();
  if (mode === "off") return;
  const action: HotdeskAction = listing && isHotdeskEligible(listing) ? "upsert" : "remove";
  const payload = action === "upsert" && listing ? toHotdeskListing(listing) : { external_id: String(id) };

  if (mode === "preview") {
    console.log(`[hotdesk:preview] ${reason} #${id} -> ${action}`, JSON.stringify(payload).slice(0, 500));
    return;
  }
  // mode === "live": the Hotdesk API client goes here once their documentation arrives.
  console.warn(`[hotdesk] live mode not implemented yet; #${id} ${action} skipped`);
}
