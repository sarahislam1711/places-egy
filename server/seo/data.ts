import { supabaseAdmin } from "../supabase";
import { canonicalListingPath } from "../listing-redirect";
import type { ListingRow } from "../hotdesk";

// Published inventory for server-rendered pages and the sitemap.
// Cached briefly; admin saves/deletes call invalidateInventory() so changes
// show up on the next request.

export type SeoListing = ListingRow & {
  updated_at: string | null;
  created_at: string | null;
  path: string;
};

const TTL_MS = 60_000;
let cache: { at: number; rows: SeoListing[] } | null = null;
let inflight: Promise<SeoListing[]> | null = null;

const FIELDS =
  "id,title,description,transaction_type,property_type,subtype,developer,project,location,location_area," +
  "price,currency,price_per_meter,area_sqm,outdoor_area_sqm,outdoor_price_per_meter,outdoor_area_type,price_is_lump_sum,floor,parking,furnishing,maintenance_fees,maintenance_status," +
  "delivery_date,images,is_test,rental_status,rental_start,rental_end,updated_at,created_at";

// Columns added by sql/listings-outdoor-and-fx.sql. If the code is deployed
// before that migration runs, the query is retried without them so listing
// pages keep working (the extra-area features just stay off until it runs).
const NEW_COLUMNS = ["outdoor_area_sqm", "outdoor_price_per_meter", "outdoor_area_type", "price_is_lump_sum"];
const LEGACY_FIELDS = FIELDS.split(",").filter((f) => !NEW_COLUMNS.includes(f)).join(",");
let fields = FIELDS;

async function load(): Promise<SeoListing[]> {
  try {
    return await loadWith(fields);
  } catch (err) {
    const msg = String((err as { message?: string })?.message ?? err);
    if (fields === FIELDS && /column|does not exist|42703/i.test(msg)) {
      console.warn("[seo] new listing columns missing (run sql/listings-outdoor-and-fx.sql); using the old ones");
      fields = LEGACY_FIELDS;
      return loadWith(fields);
    }
    throw err;
  }
}

async function loadWith(select: string): Promise<SeoListing[]> {
  if (!supabaseAdmin) return [];
  const rows: SeoListing[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabaseAdmin
      .from("listings")
      .select(select)
      .eq("is_test", false)
      .eq("property_type", "admin")
      .order("id", { ascending: false })
      .range(from, from + 999);
    if (error) throw error;
    for (const r of data as unknown as ListingRow[]) {
      rows.push({ ...(r as SeoListing), path: canonicalListingPath(r) });
    }
    if (data.length < 1000) break;
  }
  return sortForDisplay(rows);
}

// Same order as the SPA's default "Newest first": available before rented,
// then most recently updated.
export function sortForDisplay<T extends { rental_status?: string | null; updated_at: string | null; id: number }>(rows: T[]): T[] {
  return [...rows].sort(
    (a, b) =>
      Number(a.rental_status === "rented") - Number(b.rental_status === "rented") ||
      (b.updated_at ?? "").localeCompare(a.updated_at ?? "") ||
      b.id - a.id,
  );
}

/** Published (non-test) listings in display order. Serves stale data if Supabase fails. */
export async function getInventory(): Promise<SeoListing[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.rows;
  if (!inflight) {
    inflight = load()
      .then((rows) => {
        cache = { at: Date.now(), rows };
        return rows;
      })
      .catch((err) => {
        console.warn("[seo] inventory load failed:", err?.message ?? err);
        return cache?.rows ?? [];
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export async function getListingById(id: number): Promise<SeoListing | undefined> {
  return (await getInventory()).find((l) => l.id === id);
}

export function invalidateInventory(): void {
  cache = null;
}
