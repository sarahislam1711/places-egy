// Server-side guard: the admin form already blocks impossible prices, but the
// API did not, so a script or a stale browser tab could still save one (a USD
// amount saved as EGP, an extra area with no rate...). Same rules as the form.
import { listingIssues, type CheckableListing } from "../client/src/lib/listing-checks";

// Only re-check when the edit touches something the rules look at, so
// unrelated edits (status, photos) to an older listing are never refused.
const CHECKED_FIELDS = [
  "title", "description", "area_sqm", "price", "currency", "transaction_type", "price_per_meter",
  "outdoor_area_sqm", "outdoor_price_per_meter", "outdoor_area_type", "price_is_lump_sum", "furnishing",
];

export function touchesCheckedFields(changes: Record<string, unknown>): boolean {
  return CHECKED_FIELDS.some((f) => f in changes);
}

/** Blocking problems for a full listing row; empty array when it may be saved. */
export function blockingProblems(row: CheckableListing): string[] {
  return listingIssues(row)
    .filter((i) => i.severity === "block")
    .map((i) => `${i.rule}: ${i.fix}`);
}
