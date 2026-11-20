// PLACES pricing rules for a unit with an extra area (outdoor, roof, terrace,
// garden). Agreed 2026-11-19; listings are entered by the PLACES team.
//
//  1. `price` is the INDOOR price: the unit itself (price per m² × area).
//  2. The extra area is charged separately and shown separately. The team
//     enters its type, size and price per m² freely for each listing
//     (no fixed percentage of the indoor rate).
//  3. Total = indoor + extra area. Budget filters and price sorting use it.
//  4. Maintenance applies to the extra area too.
//
// A listing marked "price is a lump sum" (one figure for everything, e.g. a
// whole building) adds nothing on top.
//
// Keep free of "@/" imports: the server and scripts import this file.

export const EXTRA_AREA_TYPES = [
  { value: "outdoor", label: "Outdoor area" },
  { value: "roof", label: "Roof" },
  { value: "terrace", label: "Terrace" },
  { value: "garden", label: "Garden" },
] as const;
export type ExtraAreaType = (typeof EXTRA_AREA_TYPES)[number]["value"];

type Priced = {
  price?: number | null;
  price_per_meter?: number | null;
  area_sqm?: number | null;
  outdoor_area_sqm?: number | null;
  outdoor_price_per_meter?: number | null;
  outdoor_area_type?: string | null;
  price_is_lump_sum?: boolean | null;
};

/** "roof", "terrace"… in lower case for running text; "outdoor" by default. */
export function extraAreaWord(l: Pick<Priced, "outdoor_area_type">): string {
  const t = EXTRA_AREA_TYPES.find((x) => x.value === l.outdoor_area_type);
  return t ? (t.value === "outdoor" ? "outdoor" : t.value) : "outdoor";
}

/** True when the extra area exists but its price per m² hasn't been entered. */
export function extraAreaUnpriced(l: Priced): boolean {
  return !!Number(l.outdoor_area_sqm) && !l.price_is_lump_sum && l.outdoor_price_per_meter == null;
}

/** Amount for the extra area (area × its price per m²), or 0 when none / lump sum / not priced. */
export function outdoorAmount(l: Priced): number {
  const area = Number(l.outdoor_area_sqm) || 0;
  if (!area || l.price_is_lump_sum || l.outdoor_price_per_meter == null) return 0;
  return Math.round(area * Number(l.outdoor_price_per_meter));
}

/** Indoor price + extra area: what the tenant/buyer actually pays. */
export function totalPrice(l: Priced): number {
  const indoor = Number(l.price) || 0;
  return indoor > 0 ? indoor + outdoorAmount(l) : 0;
}

/** Area that maintenance is charged on (indoor + extra area). */
export function maintenanceArea(l: Priced): number {
  return (Number(l.area_sqm) || 0) + (Number(l.outdoor_area_sqm) || 0);
}
